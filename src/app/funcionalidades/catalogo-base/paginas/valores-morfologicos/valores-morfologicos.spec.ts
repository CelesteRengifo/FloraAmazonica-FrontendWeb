import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValoresMorfologicos } from './valores-morfologicos';

describe('ValoresMorfologicos', () => {
  let component: ValoresMorfologicos;
  let fixture: ComponentFixture<ValoresMorfologicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValoresMorfologicos],
    }).compileComponents();

    fixture = TestBed.createComponent(ValoresMorfologicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
