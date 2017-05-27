import { AngularGaugePage } from './app.po';

describe('angular-gauge App', function() {
  let page: AngularGaugePage;

  beforeEach(() => {
    page = new AngularGaugePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
