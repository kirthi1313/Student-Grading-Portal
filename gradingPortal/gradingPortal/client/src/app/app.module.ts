import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MessagesComponent } from './messages/messages.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import { addClassDialog, addSubjectDialog, addUserDialog, AdminComponent, addTestDialog, assignPupilClassDialog, assignPupilDialog, testResultDialog } from './admin/admin.component';
import {MatTabsModule} from '@angular/material/tabs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { addMessageDialog, PupilComponent } from './pupil/pupil.component';
import { TeacherComponent, addTestTeacherDialog, addResultDialog } from './teacher/teacher.component';
import {MatBadgeModule} from '@angular/material/badge';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    MatToolbarModule,
    MatCardModule,
    MatSelectModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTableModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,FontAwesomeModule,
    MatBadgeModule,
    NgxCsvParserModule
  ],
  declarations: [
    AppComponent,
    AdminComponent,
    addUserDialog,
    addClassDialog,
    addSubjectDialog,
    assignPupilDialog,
    addTestDialog,
    addTestTeacherDialog,
    assignPupilClassDialog,
    testResultDialog,
    PupilComponent,
    TeacherComponent,
    addResultDialog,
    addMessageDialog
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
