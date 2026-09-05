import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

// Render the production Liquid templates with Jekyll's real JSON filters.
const result = spawnSync('bundle', ['exec', 'ruby', '-rjekyll', '-ryaml', '-rjson', '-e', `
  Liquid::Template.register_filter(Jekyll::Filters)
  copy = YAML.load_file('_data/dial/en.yml')
  faq = YAML.load_file('_data/dial_faq.yml')
  prices = YAML.load_file('_data/dial_prices.yml')
  hostile = 'Quote " and slash \\ and </script><script>broken</script>'
  copy['schema_description'] = hostile
  output = faq.map do |lang, data|
    data['items'] = data['items'].rotate(3)
    context = {
      'site' => {'data' => {'dial_faq' => faq, 'dial' => {'en' => copy}}},
      'page' => {'lang' => lang, 'canonical' => 'https://zentsu.app/dial/'},
      'copy' => copy, 'prices' => prices.fetch(lang),
      'app_store_url' => 'https://apps.apple.com/app/id6789408903?ct=quote"test'
    }
    rendered = ['head', 'faq'].to_h do |name|
      template = Liquid::Template.parse(File.read('_includes/dial/' + name + '.html'))
      [name, template.render!(context)]
    end
    [lang, {'rendered' => rendered, 'items' => data['items'], 'prices' => prices.fetch(lang)}]
  end.to_h
  puts JSON.generate({'locales' => output, 'description' => hostile})
`], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
assert.equal(result.status, 0, result.stderr);
const fixture = JSON.parse(result.stdout);
const jsonLd = (html) => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'template must render JSON-LD');
  return JSON.parse(match[1]);
};

test('application schema safely encodes copy and keeps free and paid offers in every locale', () => {
  assert.equal(Object.keys(fixture.locales).length, 33);
  for (const [lang, { rendered, prices }] of Object.entries(fixture.locales)) {
    const app = jsonLd(rendered.head);
    assert.equal(app.description, fixture.description, lang);
    assert.equal(app.downloadUrl, 'https://apps.apple.com/app/id6789408903?ct=quote"test');
    assert.equal(app.offers[0].price, 0, lang);
    for (const [index, plan] of ['lifetime', 'annual', 'monthly'].entries()) {
      assert.equal(app.offers[index + 1].price, prices[plan], `${lang}: ${plan}`);
    }
    assert.ok(app.offers.every((offer) => offer.priceCurrency === prices.currency));
    assert.equal(app.aggregateRating, undefined, 'no invented rating when rating data is absent');
  }
});

test('reordering questions keeps localized prices attached to the semantic pricing item', () => {
  for (const [lang, { rendered, items, prices }] of Object.entries(fixture.locales)) {
    assert.equal(items.filter((item) => item.type === 'pricing').length, 1, lang);
    const faq = jsonLd(rendered.faq);
    assert.equal(faq.mainEntity.length, items.length);
    items.forEach((item, index) => {
      const actual = faq.mainEntity[index];
      assert.equal(actual.name, item.q);
      if (item.type === 'pricing') {
        for (const plan of ['lifetime', 'annual', 'monthly']) {
          assert.ok(actual.acceptedAnswer.text.includes(prices[`${plan}_display`]), `${lang}: ${plan}`);
        }
        assert.ok(rendered.faq.includes(`<p>${actual.acceptedAnswer.text}</p>`));
      } else {
        assert.equal(actual.acceptedAnswer.text, item.a, `${lang}: ${item.q}`);
      }
    });
  }
});
