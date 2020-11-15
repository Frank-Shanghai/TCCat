import request from '@/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

export async function fakeAccountLogin(params: LoginParamsType) {
  return request('/api/login/account', {
    method: 'POST',
    data: params,
  });
}

export async function getCurrentUserDetails(){
  return request('/api/Account/CurrentUserDetails', {
    method: 'GET',
    //parseResponse: false
  });
}

export async function accountLogin(params: LoginParamsType): Promise<any> {  
  const result = request('/token', {
    method: 'POST',
    headers: {"Content-Type": "application/x-www-form-urlencoded"}, // "Content-Type", case sensitive
    data: {
      'grant_type': 'password',
      'username': params.userName,
      'password': params.password      
    },
    requestType: 'form' // required
  });   

  return result;
}

export async function getUserInfo(): Promise<any> {
  const result = request('/api/Account/UserInfo', {
    method: 'Get',
  });

  return result;
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}
