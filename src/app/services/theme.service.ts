/* eslint-disable radix */
/**
 * Theme Service
 *
 * It handles the theme of the app. It allow to setup a theme or
 * to change a part of the current theme in use
 *
 * */

import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as Color from 'color';
import cssVars from 'css-vars-ponyfill';

import { ConfigService } from './config.service';
//  import { DeviceService } from './device.service';
//  import { RouterService } from './router.service';
import { debounceTime, map } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { CommunicationService } from './communication.service';

const defaults: ITHEME = {
  primary: '#3880ff',
  secondary: '#0cd1e8',
  tertiary: '#ff0000',
  select: 'rgba(226, 249, 0, 0.6)',
  success: '#10dc60',
  warning: '#ffce00',
  danger: '#f04141',
  dark: '#000000',
  medium: '#989aa2',
  light: '#ffffff',
  fontXxxlg: '28px',
  fontXxlg: '25px',
  fontXlg: '22px',
  fontLg: '20px',
  fontMd: '17px',
  fontSm: '14px',
  fontXsm: '12px',
  fontFamilyHeader: 'Roboto Slab',
  fontFamilyContent: 'Roboto',
  theme: 'webmapp',
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _style: ITHEME;
  private _theme: { [cssVarName: string]: any };
  private _iconsChar: {
    [id: string]: string;
  };

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _configService: ConfigService,
    private _platform: Platform,
    // private _routerService: RouterService,
    private _communicationService: CommunicationService
  ) {
    this._iconsChar = {};


    this._getStyle().then(style => {
      console.log("------- ~ ThemeService ~ this._getStyle ~ style", style);
      this._style = style;
      this.setTheme(this._style);
      try {
        if (this._platform.is('mobile')) {
          this._platform.ready().then(() => {
            const webviewVersion = 50;
            // this._deviceService.isAndroid ? parseInt(window.navigator.userAgent.split('Chrome')[1].split('.')[0].substring(1)) : 50;
            if (!Number.isNaN(webviewVersion) && webviewVersion < 49)
              {this._updateCssVars();}
          });
        }
      } catch (e) { }
    });
  }



  /**
   * Override all global variables with a new theme
   *
   * @param theme the theme to use
   */
  setTheme(theme: ITHEME): void {
    console.log("------- ~ ThemeService ~ setTheme ~ theme", theme);
    const cssText = this._cssTextGenerator(theme);
    this._setGlobalCSS(cssText);
  }

  async _getStyle(): Promise<any> {
    return await this._communicationService
      .get(this._configService.configUrl)
      .pipe(map(x => x.THEME))
      .toPromise();
  }

  _updateCssVars(): void {
    this._theme = this._getCSSVariables(this._style);
    // this._routerService.onStateChange.pipe(debounceTime(30)).subscribe(
    //   () => {
    //     setTimeout(() => {
    //       cssVars({
    //         variables: this._theme,
    //         include: 'link[rel=stylesheet],style',
    //       });
    //       setTimeout(() => {
    //         cssVars({
    //           variables: this._theme,
    //           include: 'link[rel=stylesheet],style',
    //         });
    //       }, 50);
    //     }, 0);
    //   },
    //   (err) => {
    //     console.warn(err);
    //   }
    // );
  }

  /**
   * Define a single CSS variable
   *
   * @param name the variabile name
   * @param value the variable value
   */
  setVariable(name: string, value: string) {
    this._document.documentElement.style.setProperty(name, value);
  }

  /**
   * Return a contrast color based on the color param
   *
   * @param color the color to get contrast
   * @param ratio the ratio of contrast. Higher value means higher contrast
   */
  contrast(color: any, ratio: number = 0.8): string {
    if (color === '#000000') {return '#ffffff';}
    if (color === '#ffffff') {return '#000000';}

    color = Color(color);
    return color.isDark()
      ? color.lighten(ratio).hex()
      : color.darken(ratio).hex();
  }

  /**
   * Return a darker color based on the color param
   *
   * @param color the color to get the dark version of
   * @param ratio the ratio of dark. Higher value means darker
   */
  darken(color: any, ratio: number = 0.8): string {
    color = Color(color);

    return color.darken(ratio).hex();
  }

  /**
   * Return a lighter color based on the specified color
   *
   * @param color the color to lighten
   * @param ratio the shade ratio. Default 0.8
   */
  lighten(color: any, ratio: number = 0.8): string {
    color = Color(color);

    return color.lighten(ratio).hex();
  }

  /**
   * Return the shade of the specified color by the specified ratio
   *
   * @param color the color to shade
   * @param ratio the shade ratio. Default 0.8
   */
  fade(color: any, ratio: number = 0.8): string {
    color = Color(color);

    return color.fade(ratio).hex();
  }

  /**
   * Return the rgb string for the specified color
   *
   * @param color the color
   */
  getRgb(color: string): string {
    const c = Color(color);
    return c.color.join(',');
  }

  /**
   * Return the feature default color
   */
  getDefaultFeatureColor(): string {
    const color: string = this._style.defaultFeatureColor
      ? this._style.defaultFeatureColor
      : defaults.defaultFeatureColor;
    return color.replace(/ /g, '');
  }

  /**
   * Return the primary color
   */
  getPrimaryColor(): string {
    const color: string = this._style.primary
      ? this._style.primary
      : defaults.primary;
    return color.replace(/ /g, '');
  }

  /**
   * Return the secondary color
   */
  getSecondaryColor(): string {
    const color: string = this._style.secondary
      ? this._style.secondary
      : defaults.secondary;
    return color.replace(/ /g, '');
  }

  /**
   * Return the tertiary color
   */
  getTertiaryColor(): string {
    const color: string = this._style.tertiary
      ? this._style.tertiary
      : defaults.tertiary;
    return color.replace(/ /g, '');
  }

  /**
   * Return the select color
   */
  getSelectColor(): string {
    const color: string = this._style.select
      ? this._style.select
      : defaults.select;
    return color.replace(/ /g, '');
  }

  /**
   * Return the light color
   */
  getLightColor(): string {
    const color: string = this._style.light ? this._style.light : defaults.light;
    return color.replace(/ /g, '');
  }
  /**
   * Return the medium color
   */
  getMediumColor(): string {
    const color: string = this._style.medium
      ? this._style.medium
      : defaults.medium;
    return color.replace(/ /g, '');
  }
  /**
   * Return the dark color
   */
  getDarkColor(): string {
    const color: string = this._style.dark ? this._style.dark : defaults.dark;
    return color.replace(/ /g, '');
  }

  /**
   * Return the success color
   */
  getSuccessColor(): string {
    const color: string = this._style.success
      ? this._style.success
      : defaults.success;
    return color.replace(/ /g, '');
  }

  /**
   * Return the danger color
   */
  getDangerColor(): string {
    const color: string = this._style.danger
      ? this._style.danger
      : defaults.danger;
    return color.replace(/ /g, '');
  }

  /**
   * Return the font-size in pixels for the specified size
   *
   * @param type the size between 'xsm', 'sm', 'md', 'lg', 'xlg', 'xxlg', 'xxxlg'. Default sm
   */
  getFontSize(type: string) {
    switch (type.toLowerCase()) {
      case 'xxxlg':
        return parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--font-xxxlg')
            .replace(/px/g, '')
        );
      case 'xxlg':
        return parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--font-xxlg')
            .replace(/px/g, '')
        );
      case 'xlg':
        return parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--font-xlg')
            .replace(/px/g, '')
        );
      case 'lg':
        return parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--font-lg')
            .replace(/px/g, '')
        );
      case 'md':
        return parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--font-md')
            .replace(/px/g, '')
        );
      case 'sm':
      default:
        return parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--font-sm')
            .replace(/px/g, '')
        );
      case 'xsm':
        return parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--font-xsm')
            .replace(/px/g, '')
        );
    }
  }

  /**
   * Return the active theme in the app
   */
  getThemeType(): string {
    return this._style.theme ? this._style.theme : 'webmapp';
  }

  /**
   * Return the header font-family
   */
  getHeaderFontFamily(): string {
    return this._style.fontFamilyHeader
      ? this._style.fontFamilyHeader
      : defaults.fontFamilyHeader;
  }

  /**
   * Return the content font-family
   */
  getContentFontFamily(): string {
    return this._style.fontFamilyContent
      ? this._style.fontFamilyContent
      : defaults.fontFamilyContent;
  }

  /**
   * Return the unicode char for the specified icon class name
   *
   * @param className
   */
  getIconUnicode(className: string): string {
    if (this._iconsChar[className]) {return this._iconsChar[className];}

    const testI = document.createElement('i');
    testI.className = className;
    document.body.appendChild(testI);
    const char = window
      .getComputedStyle(testI, ':before')
      .content.replace(/'|'/g, '');
    testI.remove();

    this._iconsChar[className] = char;

    return char;
  }

  private _setGlobalCSS(css: string) {
    this._document.documentElement.style.cssText = css;
  }

  private _cssTextGenerator(colors: ITHEME): string {
    colors = { ...defaults, ...colors };

    const {
      primary,
      secondary,
      tertiary,
      success,
      warning,
      danger,
      dark,
      medium,
      light,
      fontXxxlg,
      fontXxlg,
      fontXlg,
      fontLg,
      fontMd,
      fontSm,
      fontXsm,
      fontFamilyHeader,
      fontFamilyContent,
      defaultFeatureColor,
      theme,
    } = colors;

    const shadeRatio: number = 0.1;
    const tintRatio: number = 0.1;
    const contrastRatio: number = 10;

    return `
       --ion-color-base:  light};
       --ion-color-contrast: ${dark};
       --ion-background-color: ${light};
       --ion-text-color: ${dark};
       --ion-toolbar-background-color: ${this.contrast(light, 0.1)};
       --ion-toolbar-text-color: ${this.contrast(dark, 0.1)};
       --ion-item-background-color: ${this.contrast(light, 0.3)};
       --ion-item-text-color: ${this.contrast(dark, 0.3)};
       --ion-color-primary: ${primary};
       --ion-color-primary-rgb: ${Color(primary).array().toString()};
       --ion-color-primary-contrast: ${this.contrast(primary, contrastRatio)};
       --ion-color-primary-contrast-rgb: ${Color(
      this.contrast(primary, contrastRatio)
    )
        .array()
        .toString()};
       --ion-color-primary-shade:  ${Color(primary).darken(shadeRatio)};
       --ion-color-primary-tint:  ${Color(primary).lighten(tintRatio)};
       --ion-color-secondary: ${secondary};
       --ion-color-secondary-rgb: ${Color(secondary).array().toString()};
       --ion-color-secondary-contrast: ${this.contrast(
          secondary,
          contrastRatio
        )};
       --ion-color-secondary-contrast-rgb: ${Color(
          this.contrast(secondary, contrastRatio)
        )
        .array()
        .toString()};
       --ion-color-secondary-shade:  ${Color(secondary).darken(shadeRatio)};
       --ion-color-secondary-tint: ${Color(secondary).lighten(tintRatio)};
       --ion-color-tertiary:  ${tertiary};
       --ion-color-tertiary-rgb: ${Color(tertiary).array().toString()};
       --ion-color-tertiary-contrast: ${this.contrast(tertiary, contrastRatio)};
       --ion-color-tertiary-contrast-rgb: ${Color(
          this.contrast(tertiary, contrastRatio)
        )
        .array()
        .toString()};
       --ion-color-tertiary-shade: ${Color(tertiary).darken(shadeRatio)};
       --ion-color-tertiary-tint:  ${Color(tertiary).lighten(tintRatio)};
       --ion-color-success: ${success};
       --ion-color-success-rgb: ${Color(success).array().toString()};
       --ion-color-success-contrast: ${this.contrast(success, contrastRatio)};
       --ion-color-success-contrast-rgb: ${Color(
          this.contrast(success, contrastRatio)
        )
        .array()
        .toString()};
       --ion-color-success-shade: ${Color(success).darken(shadeRatio)};
       --ion-color-success-tint: ${Color(success).lighten(tintRatio)};
       --ion-color-warning: ${warning};
       --ion-color-warning-rgb: ${Color(warning).array().toString()};
       --ion-color-warning-contrast: ${this.contrast(warning, contrastRatio)};
       --ion-color-warning-contrast-rgb: ${Color(
          this.contrast(warning, contrastRatio)
        )
        .array()
        .toString()};
       --ion-color-warning-shade: ${Color(warning).darken(shadeRatio)};
       --ion-color-warning-tint: ${Color(warning).lighten(tintRatio)};
       --ion-color-danger: ${danger};
       --ion-color-danger-rgb: ${Color(danger).array().toString()};
       --ion-color-danger-contrast: ${this.contrast(danger, contrastRatio)};
       --ion-color-danger-contrast-rgb: ${Color(
          this.contrast(danger, contrastRatio)
        )
        .array()
        .toString()};
       --ion-color-danger-shade: ${Color(danger).darken(shadeRatio)};
       --ion-color-danger-tint: ${Color(danger).lighten(tintRatio)};
       --ion-color-dark: ${dark};
       --ion-color-dark-rgb: ${Color(dark).array().toString()};
       --ion-color-dark-contrast: ${this.contrast(dark, contrastRatio)};
       --ion-color-dark-contrast-rgb: ${Color(this.contrast(dark, contrastRatio))
        .array()
        .toString()};
       --ion-color-dark-shade: ${Color(dark).darken(shadeRatio)};
       --ion-color-dark-tint: ${Color(dark).lighten(tintRatio)};
       --ion-color-medium: ${medium};
       --ion-color-medium-rgb: ${Color(medium).array().toString()};
       --ion-color-medium-contrast: ${this.contrast(medium, contrastRatio)};
       --ion-color-medium-contrast-rgb: ${Color(
          this.contrast(medium, contrastRatio)
        )
        .array()
        .toString()};
       --ion-color-medium-shade: ${Color(medium).darken(shadeRatio)};
       --ion-color-medium-tint: ${Color(medium).lighten(tintRatio)};
       --ion-color-light: ${light};
       --ion-color-light-rgb: ${Color(light).array().toString()};
       --ion-color-light-contrast: ${this.contrast(light, contrastRatio)};
       --ion-color-light-contrast-rgb: ${Color(
          this.contrast(light, contrastRatio)
        )
        .array()
        .toString()};
       --ion-color-light-shade: ${Color(light).darken(shadeRatio)};
       --ion-color-light-tint: ${Color(light).lighten(tintRatio)};
       
       --font-xxxlg: ${fontXxxlg};
       --font-xxlg: ${fontXxlg};
       --font-xlg: ${fontXlg};
       --font-lg: ${fontLg};
       --font-md: ${fontMd};
       --font-sm: ${fontSm};
       --font-xsm: ${fontXsm};
 
       --font-family-header: ${fontFamilyHeader};
       --font-family-content: ${fontFamilyContent};
     `;
  }

  private _getCSSVariables(colors: ITHEME): { [name: string]: any } {
    colors = { ...defaults, ...colors };

    const {
      primary,
      secondary,
      tertiary,
      success,
      warning,
      danger,
      dark,
      medium,
      light,
      fontXxxlg,
      fontXxlg,
      fontXlg,
      fontLg,
      fontMd,
      fontSm,
      fontXsm,
      fontFamilyHeader,
      fontFamilyContent,
      theme,
    } = colors;

    const shadeRatio: number = 0.1;
    const tintRatio: number = 0.1;

    return {
      '--ion-color-base': light,
      '--ion-color-contrast': dark,
      '--ion-background-color': light,
      '--ion-text-color': dark,
      '--ion-toolbar-background-color': this.contrast(light, 0.1),
      '--ion-toolbar-text-color': this.contrast(dark, 0.1),
      '--ion-item-background-color': this.contrast(light, 0.3),
      '--ion-item-text-color': this.contrast(dark, 0.3),
      '--ion-color-primary': primary,
      '--ion-color-primary-rgb': Color(primary).array().toString(),
      '--ion-color-primary-contrast': this.contrast(primary),
      '--ion-color-primary-contrast-rgb': Color(this.contrast(primary))
        .array()
        .toString(),
      '--ion-color-primary-shade': Color(primary).darken(shadeRatio),
      '--ion-color-primary-tint': Color(primary).lighten(tintRatio),
      '--ion-color-secondary': secondary,
      '--ion-color-secondary-rgb': Color(secondary).array().toString(),
      '--ion-color-secondary-contrast': this.contrast(secondary),
      '--ion-color-secondary-contrast-rgb': Color(this.contrast(secondary))
        .array()
        .toString(),
      '--ion-color-secondary-shade': Color(secondary).darken(shadeRatio),
      '--ion-color-secondary-tint': Color(secondary).lighten(tintRatio),
      '--ion-color-tertiary': tertiary,
      '--ion-color-tertiary-rgb': Color(tertiary).array().toString(),
      '--ion-color-tertiary-contrast': this.contrast(tertiary),
      '--ion-color-tertiary-contrast-rgb': Color(this.contrast(tertiary))
        .array()
        .toString(),
      '--ion-color-tertiary-shade': Color(tertiary).darken(shadeRatio),
      '--ion-color-tertiary-tint': Color(tertiary).lighten(tintRatio),
      '--ion-color-success': success,
      '--ion-color-success-rgb': Color(success).array().toString(),
      '--ion-color-success-contrast': this.contrast(success),
      '--ion-color-success-contrast-rgb': Color(this.contrast(success))
        .array()
        .toString(),
      '--ion-color-success-shade': Color(success).darken(shadeRatio),
      '--ion-color-success-tint': Color(success).lighten(tintRatio),
      '--ion-color-warning': warning,
      '--ion-color-warning-rgb': Color(warning).array().toString(),
      '--ion-color-warning-contrast': this.contrast(warning),
      '--ion-color-warning-contrast-rgb': Color(this.contrast(warning))
        .array()
        .toString(),
      '--ion-color-warning-shade': Color(warning).darken(shadeRatio),
      '--ion-color-warning-tint': Color(warning).lighten(tintRatio),
      '--ion-color-danger': danger,
      '--ion-color-danger-rgb': Color(danger).array().toString(),
      '--ion-color-danger-contrast': this.contrast(danger),
      '--ion-color-danger-contrast-rgb': Color(this.contrast(danger))
        .array()
        .toString(),
      '--ion-color-danger-shade': Color(danger).darken(shadeRatio),
      '--ion-color-danger-tint': Color(danger).lighten(tintRatio),
      '--ion-color-dark': dark,
      '--ion-color-dark-rgb': Color(dark).array().toString(),
      '--ion-color-dark-contrast': this.contrast(dark),
      '--ion-color-dark-contrast-rgb': Color(this.contrast(dark))
        .array()
        .toString(),
      '--ion-color-dark-shade': Color(dark).darken(shadeRatio),
      '--ion-color-dark-tint': Color(dark).lighten(tintRatio),
      '--ion-color-medium': medium,
      '--ion-color-medium-rgb': Color(medium).array().toString(),
      '--ion-color-medium-contrast': this.contrast(medium),
      '--ion-color-medium-contrast-rgb': Color(this.contrast(medium))
        .array()
        .toString(),
      '--ion-color-medium-shade': Color(medium).darken(shadeRatio),
      '--ion-color-medium-tint': Color(medium).lighten(tintRatio),
      '--ion-color-light': light,
      '--ion-color-light-rgb': Color(light).array().toString(),
      '--ion-color-light-contrast': this.contrast(light),
      '--ion-color-light-contrast-rgb': Color(this.contrast(light))
        .array()
        .toString(),
      '--ion-color-light-shade': Color(light).darken(shadeRatio),
      '--ion-color-light-tint': Color(light).lighten(tintRatio),
      '--font-xxxlg': fontXxxlg,
      '--font-xxlg': fontXxlg,
      '--font-xlg': fontXlg,
      '--font-lg': fontLg,
      '--font-md': fontMd,
      '--font-sm': fontSm,
      '--font-xsm': fontXsm,
      '--font-family-header': fontFamilyHeader,
      '--font-family-content': fontFamilyContent,
    };
  }
}
