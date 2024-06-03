import type { LOGIN_LOG_ERROR_TYPE} from "../api/axios/login";
import type { ApiCountryCode } from "../api/types";

import { logLoginInfo } from "../api/axios/login";
import { formatPhoneNumber, getCountryFromPhoneNumber } from "./phoneNumber";

export function logLoginState(authPhoneNumber: string, phoneCodeList: ApiCountryCode[], state: LOGIN_LOG_ERROR_TYPE) {
  const suggestedCountry = phoneCodeList && getCountryFromPhoneNumber(phoneCodeList, authPhoneNumber);
  const phoneNumFormat = formatPhoneNumber(authPhoneNumber, suggestedCountry);
  const countryCode = suggestedCountry?.countryCode || '';

  logLoginInfo({
    area_code: countryCode,
    phone: phoneNumFormat,
    error_type: state
  });
}
