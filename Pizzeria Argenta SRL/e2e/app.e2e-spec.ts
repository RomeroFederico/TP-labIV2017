import { AplicacionAngularPage } from './app.po';

describe('aplicacion-angular App', () => {
  let page: AplicacionAngularPage;

  beforeEach(() => {
    page = new AplicacionAngularPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
