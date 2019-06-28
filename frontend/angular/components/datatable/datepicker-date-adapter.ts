import { NativeDateAdapter } from '@angular/material/core';
import { DateService } from 'lsg-ext';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

/**
 * Custom date adapter to format/validate the date string that is entered by the user into the date picker input field directly,
 * not via the date picker pop-up.
 */
@Injectable()
export class DatepickerDateAdapter extends NativeDateAdapter {

  constructor(@Inject(LOCALE_ID) private localeId: string,
              private platform: Platform) {
    super(localeId, platform);
  }

  /**
   * Override parse() and delegate the parsing/formatting to our date service.
   * @param value
   * @returns {Date | null}
   */
  parse(value: any): Date | null {
    if (!value) {
      return null;
    }

    return DateService.convertStringToDate(value);
  }
}
