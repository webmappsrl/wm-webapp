(self.webpackChunkwm_webapp=self.webpackChunkwm_webapp||[]).push([[1855],{1855:(t,e,i)=>{"use strict";i.r(e),i.d(e,{ion_modal:()=>Y});var r=i(1617),a=i(8507),o=i(2030),s=i(6715),n=i(1978),d=i(1893),l=i(1598),p=i(5526),h=i(2187),c=i(7751),m=i(6581),u=i(6590),f=i(2503);i(9398);const b="undefined"!=typeof window?window:void 0;var g=(()=>(function(t){t.Dark="DARK",t.Light="LIGHT",t.Default="DEFAULT"}(g||(g={})),g))();const w={getEngine(){var t,e,i;return(null===(e=null===(t=b)||void 0===t?void 0:t.Capacitor)||void 0===e?void 0:e.isPluginAvailable("StatusBar"))&&(null===(i=b)||void 0===i?void 0:i.Capacitor.Plugins.StatusBar)},supportsDefaultStatusBarStyle(){var t,e;return!!(null===(e=null===(t=b)||void 0===t?void 0:t.Capacitor)||void 0===e?void 0:e.PluginHeaders)},setStyle(t){const e=this.getEngine();e&&e.setStyle(t)}},k=(t,e)=>{if(1===e)return 0;const i=1/(1-e);return t*i+-e*i},y=()=>{!b||b.innerWidth>=768||!w.supportsDefaultStatusBarStyle()||w.setStyle({style:g.Dark})},v=()=>{!b||b.innerWidth>=768||!w.supportsDefaultStatusBarStyle()||w.setStyle({style:g.Default})},x=async(t,e)=>{"function"==typeof t.canDismiss&&await t.canDismiss()&&(e.isRunning()?e.onFinish(()=>{t.dismiss(void 0,"handler")},{oneTimeCallback:!0}):t.dismiss(void 0,"handler"))},D=t=>.00255275*2.71828**(-14.9619*t)-1.00255*2.71828**(-.0380968*t)+1,S=t=>{const{currentBreakpoint:e,backdropBreakpoint:i}=t,r=void 0===i||i<e,a=r?`calc(var(--backdrop-opacity) * ${e})`:"0",o=(0,m.c)("backdropAnimation").fromTo("opacity",0,a);return r&&o.beforeStyles({"pointer-events":"none"}).afterClearStyles(["pointer-events"]),{wrapperAnimation:(0,m.c)("wrapperAnimation").keyframes([{offset:0,opacity:1,transform:"translateY(100%)"},{offset:1,opacity:1,transform:`translateY(${100-100*e}%)`}]),backdropAnimation:o}},E=t=>{const{currentBreakpoint:e,backdropBreakpoint:i}=t,r=`calc(var(--backdrop-opacity) * ${k(e,i)})`,a=[{offset:0,opacity:r},{offset:1,opacity:0}],o=[{offset:0,opacity:r},{offset:i,opacity:0},{offset:1,opacity:0}],s=(0,m.c)("backdropAnimation").keyframes(0!==i?o:a);return{wrapperAnimation:(0,m.c)("wrapperAnimation").keyframes([{offset:0,opacity:1,transform:`translateY(${100-100*e}%)`},{offset:1,opacity:1,transform:"translateY(100%)"}]),backdropAnimation:s}},A=(t,e)=>{const{presentingEl:i,currentBreakpoint:r}=e,a=(0,n.g)(t),{wrapperAnimation:o,backdropAnimation:s}=void 0!==r?S(e):{backdropAnimation:(0,m.c)().fromTo("opacity",.01,"var(--backdrop-opacity)").beforeStyles({"pointer-events":"none"}).afterClearStyles(["pointer-events"]),wrapperAnimation:(0,m.c)().fromTo("transform","translateY(100vh)","translateY(0vh)")};s.addElement(a.querySelector("ion-backdrop")),o.addElement(a.querySelectorAll(".modal-wrapper, .modal-shadow")).beforeStyles({opacity:1});const d=(0,m.c)("entering-base").addElement(t).easing("cubic-bezier(0.32,0.72,0,1)").duration(500).addAnimation(o);if(i){const t=window.innerWidth<768,e="ION-MODAL"===i.tagName&&void 0!==i.presentingElement,r=(0,n.g)(i),a=(0,m.c)().beforeStyles({transform:"translateY(0)","transform-origin":"top center",overflow:"hidden"}),l=document.body;if(t){const t=CSS.supports("width","max(0px, 1px)")?"max(30px, var(--ion-safe-area-top))":"30px",r=`translateY(${e?"-10px":t}) scale(0.93)`;a.afterStyles({transform:r}).beforeAddWrite(()=>l.style.setProperty("background-color","black")).addElement(i).keyframes([{offset:0,filter:"contrast(1)",transform:"translateY(0px) scale(1)",borderRadius:"0px"},{offset:1,filter:"contrast(0.85)",transform:r,borderRadius:"10px 10px 0 0"}]),d.addAnimation(a)}else if(d.addAnimation(s),e){const t=`translateY(-10px) scale(${e?.93:1})`;a.afterStyles({transform:t}).addElement(r.querySelector(".modal-wrapper")).keyframes([{offset:0,filter:"contrast(1)",transform:"translateY(0) scale(1)"},{offset:1,filter:"contrast(0.85)",transform:t}]);const i=(0,m.c)().afterStyles({transform:t}).addElement(r.querySelector(".modal-shadow")).keyframes([{offset:0,opacity:"1",transform:"translateY(0) scale(1)"},{offset:1,opacity:"0",transform:t}]);d.addAnimation([a,i])}else o.fromTo("opacity","0","1")}else d.addAnimation(s);return d},B=(t,e,i=500)=>{const{presentingEl:r,currentBreakpoint:a}=e,o=(0,n.g)(t),{wrapperAnimation:s,backdropAnimation:d}=void 0!==a?E(e):{backdropAnimation:(0,m.c)().fromTo("opacity","var(--backdrop-opacity)",0),wrapperAnimation:(0,m.c)().fromTo("transform","translateY(0vh)","translateY(100vh)")};d.addElement(o.querySelector("ion-backdrop")),s.addElement(o.querySelectorAll(".modal-wrapper, .modal-shadow")).beforeStyles({opacity:1});const l=(0,m.c)("leaving-base").addElement(t).easing("cubic-bezier(0.32,0.72,0,1)").duration(i).addAnimation(s);if(r){const t=window.innerWidth<768,e="ION-MODAL"===r.tagName&&void 0!==r.presentingElement,i=(0,n.g)(r),a=(0,m.c)().beforeClearStyles(["transform"]).afterClearStyles(["transform"]).onFinish(t=>{1===t&&(r.style.setProperty("overflow",""),Array.from(o.querySelectorAll("ion-modal")).filter(t=>void 0!==t.presentingElement).length<=1&&o.style.setProperty("background-color",""))}),o=document.body;if(t){const t=CSS.supports("width","max(0px, 1px)")?"max(30px, var(--ion-safe-area-top))":"30px",i=`translateY(${e?"-10px":t}) scale(0.93)`;a.addElement(r).keyframes([{offset:0,filter:"contrast(0.85)",transform:i,borderRadius:"10px 10px 0 0"},{offset:1,filter:"contrast(1)",transform:"translateY(0px) scale(1)",borderRadius:"0px"}]),l.addAnimation(a)}else if(l.addAnimation(d),e){const t=`translateY(-10px) scale(${e?.93:1})`;a.addElement(i.querySelector(".modal-wrapper")).afterStyles({transform:"translate3d(0, 0, 0)"}).keyframes([{offset:0,filter:"contrast(0.85)",transform:t},{offset:1,filter:"contrast(1)",transform:"translateY(0) scale(1)"}]);const r=(0,m.c)().addElement(i.querySelector(".modal-shadow")).afterStyles({transform:"translateY(0) scale(1)"}).keyframes([{offset:0,opacity:"0",transform:t},{offset:1,opacity:"1",transform:"translateY(0) scale(1)"}]);l.addAnimation([a,r])}else s.fromTo("opacity","1","0")}else l.addAnimation(d);return l},C=(t,e)=>{const{currentBreakpoint:i}=e,r=(0,n.g)(t),{wrapperAnimation:a,backdropAnimation:o}=void 0!==i?S(e):{backdropAnimation:(0,m.c)().fromTo("opacity",.01,"var(--backdrop-opacity)").beforeStyles({"pointer-events":"none"}).afterClearStyles(["pointer-events"]),wrapperAnimation:(0,m.c)().keyframes([{offset:0,opacity:.01,transform:"translateY(40px)"},{offset:1,opacity:1,transform:"translateY(0px)"}])};return o.addElement(r.querySelector("ion-backdrop")),a.addElement(r.querySelector(".modal-wrapper")),(0,m.c)().addElement(t).easing("cubic-bezier(0.36,0.66,0.04,1)").duration(280).addAnimation([o,a])},T=(t,e)=>{const{currentBreakpoint:i}=e,r=(0,n.g)(t),{wrapperAnimation:a,backdropAnimation:o}=void 0!==i?E(e):{backdropAnimation:(0,m.c)().fromTo("opacity","var(--backdrop-opacity)",0),wrapperAnimation:(0,m.c)().keyframes([{offset:0,opacity:.99,transform:"translateY(0px)"},{offset:1,opacity:0,transform:"translateY(40px)"}])};return o.addElement(r.querySelector("ion-backdrop")),a.addElement(r.querySelector(".modal-wrapper")),(0,m.c)().easing("cubic-bezier(0.47,0,0.745,0.715)").duration(200).addAnimation([o,a])},Y=class{constructor(t){(0,r.r)(this,t),this.didPresent=(0,r.e)(this,"ionModalDidPresent",7),this.willPresent=(0,r.e)(this,"ionModalWillPresent",7),this.willDismiss=(0,r.e)(this,"ionModalWillDismiss",7),this.didDismiss=(0,r.e)(this,"ionModalDidDismiss",7),this.ionBreakpointDidChange=(0,r.e)(this,"ionBreakpointDidChange",7),this.didPresentShorthand=(0,r.e)(this,"didPresent",7),this.willPresentShorthand=(0,r.e)(this,"willPresent",7),this.willDismissShorthand=(0,r.e)(this,"willDismiss",7),this.didDismissShorthand=(0,r.e)(this,"didDismiss",7),this.modalIndex=M++,this.coreDelegate=(0,s.C)(),this.isSheetModal=!1,this.inline=!1,this.gestureAnimationDismissing=!1,this.presented=!1,this.hasController=!1,this.keyboardClose=!0,this.backdropBreakpoint=0,this.backdropDismiss=!0,this.showBackdrop=!0,this.animated=!0,this.swipeToClose=!1,this.isOpen=!1,this.configureTriggerInteraction=()=>{const{trigger:t,el:e,destroyTriggerInteraction:i}=this;i&&i();const r=void 0!==t?document.getElementById(t):null;r&&(this.destroyTriggerInteraction=((t,e)=>{const i=()=>{e.present()};return t.addEventListener("click",i),()=>{t.removeEventListener("click",i)}})(r,e))},this.onBackdropTap=()=>{this.dismiss(void 0,p.B)},this.onLifecycle=t=>{const e=this.usersElement,i=P[t.type];if(e&&i){const r=new CustomEvent(i,{bubbles:!1,cancelable:!1,detail:t.detail});e.dispatchEvent(r)}}}onIsOpenChange(t,e){!0===t&&!1===e?this.present():!1===t&&!0===e&&this.dismiss()}onTriggerChange(){this.configureTriggerInteraction()}async swipeToCloseChanged(t){this.gesture?this.gesture.enable(t):t&&await this.initSwipeToClose()}breakpointsChanged(t){void 0!==t&&(this.sortedBreakpoints=t.sort((t,e)=>t-e))}connectedCallback(){(0,p.e)(this.el)}componentWillLoad(){const{breakpoints:t,initialBreakpoint:e,swipeToClose:i}=this;this.modalId=this.el.hasAttribute("id")?this.el.getAttribute("id"):`ion-modal-${this.modalIndex}`,(this.isSheetModal=void 0!==t&&void 0!==e)&&(this.currentBreakpoint=this.initialBreakpoint),void 0===t||void 0===e||t.includes(e)||(0,l.p)("Your breakpoints array must include the initialBreakpoint value."),i&&(0,l.p)("swipeToClose has been deprecated in favor of canDismiss.\n\nIf you want a card modal to be swipeable, set canDismiss to `true`. In the next major release of Ionic, swipeToClose will be removed, and all card modals will be swipeable by default.")}componentDidLoad(){!0===this.isOpen&&(0,n.r)(()=>this.present()),this.breakpointsChanged(this.breakpoints),this.configureTriggerInteraction()}getDelegate(t=!1){if(this.workingDelegate&&!t)return{delegate:this.workingDelegate,inline:this.inline};const e=this.inline=null!==this.el.parentNode&&!this.hasController;return{inline:e,delegate:this.workingDelegate=e?this.delegate||this.coreDelegate:this.delegate}}async checkCanDismiss(){const{canDismiss:t}=this;return void 0===t||("function"==typeof t?t():t)}async present(){if(this.presented)return;void 0!==this.currentTransition&&await this.currentTransition,this.currentBreakpoint=this.initialBreakpoint;const t=Object.assign(Object.assign({},this.componentProps),{modal:this.el}),{inline:e,delegate:i}=this.getDelegate(!0);this.usersElement=await(0,s.a)(i,this.el,this.component,["ion-page"],t,e),await(0,c.e)(this.usersElement),(0,r.c)(()=>this.el.classList.add("show-modal")),this.currentTransition=(0,p.d)(this,"modalEnter",A,C,{presentingEl:this.presentingElement,currentBreakpoint:this.initialBreakpoint,backdropBreakpoint:this.backdropBreakpoint});const o=this.swipeToClose||void 0!==this.canDismiss&&void 0!==this.presentingElement;o&&"ios"===(0,a.b)(this)&&y(),await this.currentTransition,this.isSheetModal?this.initSheetGesture():o&&await this.initSwipeToClose(),"undefined"!=typeof window&&(this.keyboardOpenCallback=()=>{this.gesture&&(this.gesture.enable(!1),(0,n.r)(()=>{this.gesture&&this.gesture.enable(!0)}))},window.addEventListener(d.KEYBOARD_DID_OPEN,this.keyboardOpenCallback)),this.currentTransition=void 0}initSwipeToClose(){if("ios"!==(0,a.b)(this))return;const{el:t}=this,e=this.leaveAnimation||a.c.get("modalLeave",B),i=this.animation=e(t,{presentingEl:this.presentingElement});(0,o.a)(t)?(this.gesture=((t,e,i)=>{const r=.5,a=t.offsetHeight;let s=!1,d=!1,l=null,p=null,h=!0,c=0;const m=(0,f.createGesture)({el:t,gestureName:"modalSwipeToClose",gesturePriority:39,direction:"y",threshold:10,canStart:t=>{const e=t.event.target;if(null===e||!e.closest)return!0;if(l=(0,o.f)(e),l){if((0,o.i)(l)){const t=(0,n.g)(l);p=t.querySelector(".inner-scroll")}else p=l;return!l.querySelector("ion-refresher")&&0===p.scrollTop}return null===e.closest("ion-footer")},onStart:i=>{const{deltaY:r}=i;h=!l||!(0,o.i)(l)||l.scrollY,d=void 0!==t.canDismiss&&!0!==t.canDismiss,r>0&&l&&(0,o.d)(l),e.progressStart(!0,s?1:0)},onMove:t=>{const{deltaY:i}=t;i>0&&l&&(0,o.d)(l);const s=t.deltaY/a,p=s>=0&&d,h=p?.2:.9999,m=p?D(s/h):s,u=(0,n.l)(1e-4,m,h);e.progressStep(u),u>=r&&c<r?v():u<r&&c>=r&&y(),c=u},onEnd:p=>{const c=p.velocityY,f=p.deltaY/a,b=f>=0&&d,g=b?.2:.9999,w=b?D(f/g):f,k=(0,n.l)(1e-4,w,g),y=!b&&(p.deltaY+1e3*c)/a>=r;let v=y?-.001:.001;y?(e.easing("cubic-bezier(0.32, 0.72, 0, 1)"),v+=(0,u.g)([0,0],[.32,.72],[0,1],[1,1],k)[0]):(e.easing("cubic-bezier(1, 0, 0.68, 0.28)"),v+=(0,u.g)([0,0],[1,0],[.68,.28],[1,1],k)[0]);const S=((t,e)=>(0,n.l)(400,t/Math.abs(1.1*e),500))(y?f*a:(1-k)*a,c);s=y,m.enable(!1),l&&(0,o.r)(l,h),e.onFinish(()=>{y||m.enable(!0)}).progressEnd(y?1:0,v,S),b&&k>g/4?x(t,e):y&&i()}});return m})(t,i,()=>{this.gestureAnimationDismissing=!0,this.animation.onFinish(async()=>{await this.dismiss(void 0,"gesture"),this.gestureAnimationDismissing=!1})}),this.gesture.enable(!0)):(0,o.p)(t)}initSheetGesture(){const{wrapperEl:t,initialBreakpoint:e,backdropBreakpoint:i}=this;if(!t||void 0===e)return;const r=this.enterAnimation||a.c.get("modalEnter",A),o=this.animation=r(this.el,{presentingEl:this.presentingElement,currentBreakpoint:e,backdropBreakpoint:i});o.progressStart(!0,1);const{gesture:s,moveSheetToBreakpoint:d}=((t,e,i,r,a,o,s=[],d,l,p)=>{const h={WRAPPER_KEYFRAMES:[{offset:0,transform:"translateY(0%)"},{offset:1,transform:"translateY(100%)"}],BACKDROP_KEYFRAMES:0!==a?[{offset:0,opacity:"var(--backdrop-opacity)"},{offset:1-a,opacity:0},{offset:1,opacity:0}]:[{offset:0,opacity:"var(--backdrop-opacity)"},{offset:1,opacity:.01}]},c=t.querySelector("ion-content"),m=i.clientHeight;let u=r,b=0,g=!1;const w=o.childAnimations.find(t=>"wrapperAnimation"===t.id),y=o.childAnimations.find(t=>"backdropAnimation"===t.id),v=s[s.length-1],S=s[0],E=()=>{t.style.setProperty("pointer-events","auto"),e.style.setProperty("pointer-events","auto"),t.classList.remove("ion-disable-focus-trap")},A=()=>{t.style.setProperty("pointer-events","none"),e.style.setProperty("pointer-events","none"),t.classList.add("ion-disable-focus-trap")};w&&y&&(w.keyframes([...h.WRAPPER_KEYFRAMES]),y.keyframes([...h.BACKDROP_KEYFRAMES]),o.progressStart(!0,1-u),u>a?E():A()),c&&u!==v&&(c.scrollY=!1);const B=e=>{const{breakpoint:i,canDismiss:r,breakpointOffset:d}=e,m=r&&0===i,f=m?u:i,b=0!==f;u=0,w&&y&&(w.keyframes([{offset:0,transform:`translateY(${100*d}%)`},{offset:1,transform:`translateY(${100*(1-f)}%)`}]),y.keyframes([{offset:0,opacity:`calc(var(--backdrop-opacity) * ${k(1-d,a)})`},{offset:1,opacity:`calc(var(--backdrop-opacity) * ${k(f,a)})`}]),o.progressStep(0)),C.enable(!1),o.onFinish(()=>{b&&(w&&y?(0,n.r)(()=>{w.keyframes([...h.WRAPPER_KEYFRAMES]),y.keyframes([...h.BACKDROP_KEYFRAMES]),o.progressStart(!0,1-f),u=f,p(u),c&&u===s[s.length-1]&&(c.scrollY=!0),u>a?E():A(),C.enable(!0)}):C.enable(!0))},{oneTimeCallback:!0}).progressEnd(1,0,500),m?x(t,o):b||l()},C=(0,f.createGesture)({el:i,gestureName:"modalSheet",gesturePriority:40,direction:"y",threshold:10,canStart:t=>{const e=t.event.target.closest("ion-content");return u=d(),1!==u||!e},onStart:()=>{g=void 0!==t.canDismiss&&!0!==t.canDismiss&&0===S,c&&(c.scrollY=!1),(0,n.r)(()=>{t.focus()}),o.progressStart(!0,1-u)},onMove:t=>{const e=s.length>1?1-s[1]:void 0,i=1-u+t.deltaY/m,r=void 0!==e&&i>=e&&g,a=r?.95:.9999,d=r&&void 0!==e?e+D((i-e)/(a-e)):i;b=(0,n.l)(1e-4,d,a),o.progressStep(b)},onEnd:t=>{const e=u-(t.deltaY+100*t.velocityY)/m,i=s.reduce((t,i)=>Math.abs(i-e)<Math.abs(t-e)?i:t);B({breakpoint:i,breakpointOffset:b,canDismiss:g})}});return{gesture:C,moveSheetToBreakpoint:B}})(this.el,this.backdropEl,t,e,i,o,this.sortedBreakpoints,()=>{var t;return null!==(t=this.currentBreakpoint)&&void 0!==t?t:0},()=>this.sheetOnDismiss(),t=>{this.currentBreakpoint!==t&&(this.currentBreakpoint=t,this.ionBreakpointDidChange.emit({breakpoint:t}))});this.gesture=s,this.moveSheetToBreakpoint=d,this.gesture.enable(!0)}sheetOnDismiss(){this.gestureAnimationDismissing=!0,this.animation.onFinish(async()=>{this.currentBreakpoint=0,this.ionBreakpointDidChange.emit({breakpoint:this.currentBreakpoint}),await this.dismiss(void 0,"gesture"),this.gestureAnimationDismissing=!1})}async dismiss(t,e){if(this.gestureAnimationDismissing&&"gesture"!==e)return!1;if("handler"!==e&&!(await this.checkCanDismiss()))return!1;(this.swipeToClose||void 0!==this.canDismiss&&void 0!==this.presentingElement)&&"ios"===(0,a.b)(this)&&v(),"undefined"!=typeof window&&this.keyboardOpenCallback&&window.removeEventListener(d.KEYBOARD_DID_OPEN,this.keyboardOpenCallback),void 0!==this.currentTransition&&await this.currentTransition;const i=p.h.get(this)||[];this.currentTransition=(0,p.f)(this,t,e,"modalLeave",B,T,{presentingEl:this.presentingElement,currentBreakpoint:this.currentBreakpoint||this.initialBreakpoint,backdropBreakpoint:this.backdropBreakpoint});const o=await this.currentTransition;if(o){const{delegate:t}=this.getDelegate();await(0,s.d)(t,this.usersElement),(0,r.c)(()=>this.el.classList.remove("show-modal")),this.animation&&this.animation.destroy(),this.gesture&&this.gesture.destroy(),i.forEach(t=>t.destroy())}return this.currentBreakpoint=void 0,this.currentTransition=void 0,this.animation=void 0,o}onDidDismiss(){return(0,p.g)(this.el,"ionModalDidDismiss")}onWillDismiss(){return(0,p.g)(this.el,"ionModalWillDismiss")}async setCurrentBreakpoint(t){if(!this.isSheetModal)return void(0,l.p)("setCurrentBreakpoint is only supported on sheet modals.");if(!this.breakpoints.includes(t))return void(0,l.p)(`Attempted to set invalid breakpoint value ${t}. Please double check that the breakpoint value is part of your defined breakpoints.`);const{currentBreakpoint:e,moveSheetToBreakpoint:i,canDismiss:r,breakpoints:a}=this;e!==t&&i&&i({breakpoint:t,breakpointOffset:1-e,canDismiss:void 0!==r&&!0!==r&&0===a[0]})}async getCurrentBreakpoint(){return this.currentBreakpoint}render(){const{handle:t,isSheetModal:e,presentingElement:i,htmlAttributes:o}=this,s=!1!==t&&e,n=(0,a.b)(this),{modalId:d}=this,l=void 0!==i&&"ios"===n;return(0,r.h)(r.H,Object.assign({"no-router":!0,"aria-modal":"true",tabindex:"-1"},o,{style:{zIndex:`${2e4+this.overlayIndex}`},class:Object.assign({[n]:!0,"modal-default":!l&&!e,"modal-card":l,"modal-sheet":e,"overlay-hidden":!0},(0,h.g)(this.cssClass)),id:d,onIonBackdropTap:this.onBackdropTap,onIonModalDidPresent:this.onLifecycle,onIonModalWillPresent:this.onLifecycle,onIonModalWillDismiss:this.onLifecycle,onIonModalDidDismiss:this.onLifecycle}),(0,r.h)("ion-backdrop",{ref:t=>this.backdropEl=t,visible:this.showBackdrop,tappable:this.backdropDismiss,part:"backdrop"}),"ios"===n&&(0,r.h)("div",{class:"modal-shadow"}),(0,r.h)("div",{role:"dialog",class:"modal-wrapper ion-overlay-wrapper",part:"content",ref:t=>this.wrapperEl=t},s&&(0,r.h)("div",{class:"modal-handle",part:"handle"}),(0,r.h)("slot",null)))}get el(){return(0,r.i)(this)}static get watchers(){return{isOpen:["onIsOpenChange"],trigger:["onTriggerChange"],swipeToClose:["swipeToCloseChanged"]}}},P={ionModalDidPresent:"ionViewDidEnter",ionModalWillPresent:"ionViewWillEnter",ionModalWillDismiss:"ionViewWillLeave",ionModalDidDismiss:"ionViewDidLeave"};let M=0;Y.style={ios:":host{--width:100%;--min-width:auto;--max-width:auto;--height:100%;--min-height:auto;--max-height:auto;--overflow:hidden;--border-radius:0;--border-width:0;--border-style:none;--border-color:transparent;--background:var(--ion-background-color, #fff);--box-shadow:none;--backdrop-opacity:0;left:0;right:0;top:0;bottom:0;display:-ms-flexbox;display:flex;position:absolute;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;outline:none;contain:strict}.modal-wrapper,ion-backdrop{pointer-events:auto}:host(.overlay-hidden){display:none}.modal-wrapper,.modal-shadow{border-radius:var(--border-radius);width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow);overflow:var(--overflow);z-index:10}.modal-shadow{position:absolute;background:transparent}@media only screen and (min-width: 768px) and (min-height: 600px){:host{--width:600px;--height:500px;--ion-safe-area-top:0px;--ion-safe-area-bottom:0px;--ion-safe-area-right:0px;--ion-safe-area-left:0px}}@media only screen and (min-width: 768px) and (min-height: 768px){:host{--width:600px;--height:600px}}.modal-handle{left:0px;right:0px;top:5px;border-radius:8px;margin-left:auto;margin-right:auto;position:absolute;width:36px;height:5px;-webkit-transform:translateZ(0);transform:translateZ(0);background:var(--ion-color-step-350, #c0c0be);z-index:11}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.modal-handle{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}:host(.modal-sheet){--height:calc(100% - (var(--ion-safe-area-top) + 10px))}:host(.modal-sheet) .modal-wrapper,:host(.modal-sheet) .modal-shadow{position:absolute;bottom:0}:host{--backdrop-opacity:var(--ion-backdrop-opacity, 0.4)}:host(.modal-card),:host(.modal-sheet){--border-radius:10px}@media only screen and (min-width: 768px) and (min-height: 600px){:host{--border-radius:10px}}.modal-wrapper{-webkit-transform:translate3d(0,  100%,  0);transform:translate3d(0,  100%,  0)}@media screen and (max-width: 767px){@supports (width: 1px){:host(.modal-card){--height:calc(100% - max(30px, var(--ion-safe-area-top)) - 10px)}}@supports not (width: 1px){:host(.modal-card){--height:calc(100% - 40px)}}:host(.modal-card) .modal-wrapper{border-top-left-radius:var(--border-radius);border-top-right-radius:var(--border-radius);border-bottom-right-radius:0;border-bottom-left-radius:0}:host-context([dir=rtl]):host(.modal-card) .modal-wrapper,:host-context([dir=rtl]).modal-card .modal-wrapper{border-top-left-radius:var(--border-radius);border-top-right-radius:var(--border-radius);border-bottom-right-radius:0;border-bottom-left-radius:0}:host(.modal-card){--backdrop-opacity:0;--width:100%;-ms-flex-align:end;align-items:flex-end}:host(.modal-card) .modal-shadow{display:none}:host(.modal-card) ion-backdrop{pointer-events:none}}@media screen and (min-width: 768px){:host(.modal-card){--width:calc(100% - 120px);--height:calc(100% - (120px + var(--ion-safe-area-top) + var(--ion-safe-area-bottom)));--max-width:720px;--max-height:1000px;--backdrop-opacity:0;--box-shadow:0px 0px 30px 10px rgba(0, 0, 0, 0.1);-webkit-transition:all 0.5s ease-in-out;transition:all 0.5s ease-in-out}:host(.modal-card) .modal-wrapper{-webkit-box-shadow:none;box-shadow:none}:host(.modal-card) .modal-shadow{-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow)}}:host(.modal-sheet) .modal-wrapper{border-top-left-radius:var(--border-radius);border-top-right-radius:var(--border-radius);border-bottom-right-radius:0;border-bottom-left-radius:0}:host-context([dir=rtl]):host(.modal-sheet) .modal-wrapper,:host-context([dir=rtl]).modal-sheet .modal-wrapper{border-top-left-radius:var(--border-radius);border-top-right-radius:var(--border-radius);border-bottom-right-radius:0;border-bottom-left-radius:0}",md:":host{--width:100%;--min-width:auto;--max-width:auto;--height:100%;--min-height:auto;--max-height:auto;--overflow:hidden;--border-radius:0;--border-width:0;--border-style:none;--border-color:transparent;--background:var(--ion-background-color, #fff);--box-shadow:none;--backdrop-opacity:0;left:0;right:0;top:0;bottom:0;display:-ms-flexbox;display:flex;position:absolute;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;outline:none;contain:strict}.modal-wrapper,ion-backdrop{pointer-events:auto}:host(.overlay-hidden){display:none}.modal-wrapper,.modal-shadow{border-radius:var(--border-radius);width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow);overflow:var(--overflow);z-index:10}.modal-shadow{position:absolute;background:transparent}@media only screen and (min-width: 768px) and (min-height: 600px){:host{--width:600px;--height:500px;--ion-safe-area-top:0px;--ion-safe-area-bottom:0px;--ion-safe-area-right:0px;--ion-safe-area-left:0px}}@media only screen and (min-width: 768px) and (min-height: 768px){:host{--width:600px;--height:600px}}.modal-handle{left:0px;right:0px;top:5px;border-radius:8px;margin-left:auto;margin-right:auto;position:absolute;width:36px;height:5px;-webkit-transform:translateZ(0);transform:translateZ(0);background:var(--ion-color-step-350, #c0c0be);z-index:11}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.modal-handle{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}:host(.modal-sheet){--height:calc(100% - (var(--ion-safe-area-top) + 10px))}:host(.modal-sheet) .modal-wrapper,:host(.modal-sheet) .modal-shadow{position:absolute;bottom:0}:host{--backdrop-opacity:var(--ion-backdrop-opacity, 0.32)}@media only screen and (min-width: 768px) and (min-height: 600px){:host{--border-radius:2px;--box-shadow:0 28px 48px rgba(0, 0, 0, 0.4)}}.modal-wrapper{-webkit-transform:translate3d(0,  40px,  0);transform:translate3d(0,  40px,  0);opacity:0.01}"}}}]);