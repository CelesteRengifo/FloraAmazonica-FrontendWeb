import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionCatalogo } from './edicion-catalogo';

describe('EdicionCatalogo', () => {
  let component: EdicionCatalogo;
  let fixture: ComponentFixture<EdicionCatalogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdicionCatalogo],
    }).compileComponents();

    fixture = TestBed.createComponent(EdicionCatalogo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
