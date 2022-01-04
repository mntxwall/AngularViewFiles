import { NgModule } from '@angular/core';

import { WelcomeRoutingModule } from './welcome-routing.module';

import { WelcomeComponent } from './welcome.component';

import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { NzTableModule } from 'ng-zorro-antd/table';
import {BrowserModule} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import { NzSelectModule } from 'ng-zorro-antd/select';
import {FormsModule} from "@angular/forms";
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { CalculateComponent } from '../calculate/calculate.component';
import { ResultComponent } from '../result/result.component';





const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key])

@NgModule({
  imports: [
    CommonModule,
    WelcomeRoutingModule,
    NzUploadModule,
    NzButtonModule,
    NzIconModule,
    NzIconModule.forRoot(icons),
    NzTableModule,
    NzSelectModule,
    FormsModule,
    NzFormModule,
    NzListModule,
    NzModalModule
  ],
  declarations: [WelcomeComponent, CalculateComponent, ResultComponent],
  exports: [WelcomeComponent],
  providers: [{ provide: NZ_ICONS, useValue: icons } ]
})
export class WelcomeModule { }
