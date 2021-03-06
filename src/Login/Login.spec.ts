import { LoginComponent } from "./Login.component";
import { ComponentFixture, TestBed, tick, fakeAsync } from "@angular/core/testing";
import { DebugElement, NgZone } from "@angular/core";
import { By } from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { MiracleListProxy } from "Services/MiracleListProxy";
// import { HttpClient, HttpHandler } from "@angular/common/http"; --> nicht gebraucht, da Fake-Poxy verwendet!
import { CommunicationService } from "Services/CommunicationService";
import { Router, Routes } from "@angular/router";
// import { RoutingModule } from "Util/RoutingModule";
import { AppModule } from "app.module";
import { APP_BASE_HREF } from "@angular/common";
import { Location } from '@angular/common';
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "app/app.component";
import { TaskViewComponent } from "TaskView/TaskView.Component";
import { TaskEditComponent } from "TaskEdit/TaskEdit.Component";
import { LoginInfo } from "Services/MiracleListProxyV2";
import { Observable } from "rxjs/Observable";
// Das sind bisher nur Dummy-Tests. Siehe https://angular.io/guide/testing

const LOGINERRORTEXT = "Login Error";

/** Fake-Proxy, der nur die eine verwendete Methode implementiert */
class MiracleListFakeProxy {
 login(loginInfo?: LoginInfo | null | undefined): Observable<LoginInfo> {
  var r = new LoginInfo();

  if (loginInfo.username === "test" && loginInfo.password === 'test') {
   r.token = "test";
   r.message = ""; // leer = OK!
   console.log("FAKE-PROXY: OK with " + loginInfo.username + "/" + loginInfo.password);
  }
  else {
   r.message = LOGINERRORTEXT;
   console.log("FAKE-PROXY: NOT OK with " + loginInfo.username + "/" + loginInfo.password);
  }
  return Observable.create(observer => {
   observer.next(r);
   observer.complete();
  });
 }
}

export function CommunicationServiceFactory(router: Router, zone: NgZone) { return new CommunicationService(router, zone); }

describe('LoginComponent Test', () => {

 const routes: Routes = [
  { path: '', component: LoginComponent },
  {
   path: 'app', component: AppComponent

  }];

 let comp: LoginComponent;
 let fixture: ComponentFixture<LoginComponent>;
 let de: DebugElement;
 let el: HTMLElement;
 let location: Location;
 let router: Router;

 beforeEach(() => {
  TestBed.configureTestingModule({
   declarations: [], // declare the test component
   imports: [AppModule, FormsModule, RouterTestingModule.withRoutes(routes)], // used Angular Modules
   providers: [ // Services / Dependency Injection
    {
     provide: MiracleListProxy,
     useClass: MiracleListFakeProxy
    },
    // HttpClient, HttpHandler, --> nicht gebraucht, da Fake-Poxy verwendet!
    {
     provide: CommunicationService,
     useFactory: CommunicationServiceFactory,
     deps: [Router, NgZone]
    }, { provide: APP_BASE_HREF, useValue: '/' }]
  });

  fixture = TestBed.createComponent(LoginComponent);

  comp = fixture.componentInstance; // BannerComponent test instance

  router = TestBed.get(Router);
  // query for the title <h1> by CSS element selector

 });

 it('title', () => {
  fixture.detectChanges();
  el = fixture.debugElement.query(By.css('h2')).nativeElement;
  expect(el.textContent).toContain("Benutzeranmeldung");
 });

 it('name and password be empty', () => {
  fixture.detectChanges();
  var tb1 = fixture.debugElement.query(By.css('#name')).nativeElement;
  expect(tb1.value).toEqual("");
  var tb2 = fixture.debugElement.query(By.css('#password')).nativeElement;
  expect(tb2.value).toEqual("");
 });

 it('missing password cause error', () => {
  checkError("test", "");
 });

 it('missing name cause error', () => {
  checkError("", "test");
 });

 it('routing', fakeAsync(() => {
  router.navigate(['app']);
  tick();
  location = TestBed.get(Location);
  expect(location.path()).toBe('/app');
 }));

 // it('Login mit korrekten Daten', fakeAsync(() => {
 //  fixture.detectChanges();
 //  comp.name = "test";
 //  comp.password = "test";
 //  comp.login();
 //  fixture.detectChanges();
 //  content("errorMsg", "");
 //  tick();
 //  location = TestBed.get(Location);
 //  expect(location.path()).toBe('/app');
 // }));

 it('Login mit falschen Daten', fakeAsync(() => {
  fixture.detectChanges();
  comp.name = "test";
  comp.password = "xxx";
  comp.login();
  fixture.detectChanges();
  content("errorMsg", LOGINERRORTEXT);
  tick();
  location = TestBed.get(Location);
  expect(location.path()).toBe('');
 }));

 function checkError(name: string, password: string) {
  fixture.detectChanges();
  comp.name = name;
  comp.password = password;
  comp.login();
  fixture.detectChanges();
  content("errorMsg", "Benutzername und Kennwort müssen ausgefüllt sein!");

 }

 function content(id: string, content: string) {
  var errorMsg = fixture.debugElement.query(By.css('#' + id)).nativeElement;
  expect(errorMsg.textContent).toContain(content);
 }


});
