import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscadorMorfologico } from './buscador-morfologico';

describe('BuscadorMorfologico', () => {
  let component: BuscadorMorfologico;
  let fixture: ComponentFixture<BuscadorMorfologico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscadorMorfologico],
    }).compileComponents();

    fixture = TestBed.createComponent(BuscadorMorfologico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
