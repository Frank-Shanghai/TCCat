import { stringify } from 'querystring';
import { history, Reducer, Effect } from 'umi';

import { accountLogin } from '@/services/login';
import { getPageQuery } from '@/utils/utils';
import request from 'umi-request';

export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      //const response = yield call(fakeAccountLogin, payload);
      const tokenResponse = yield call(accountLogin, payload);

      if(tokenResponse && tokenResponse.ok === false) return;

      request.interceptors.request.use((url, options) => {
        return {
          url: url,
          options: {...options, headers: {'authorization': tokenResponse.token_type + " " + tokenResponse.access_token} }
        };
      });

      yield put({
        type: 'changeLoginStatus',
        payload: tokenResponse,
      });
      
      // Login successfully
      if (tokenResponse && tokenResponse.ok !== false) {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
        history.replace(redirect || '/');
      }
    },

    logout() {
      const { redirect } = getPageQuery();
      // Note: There may be security issues, please note
      if (window.location.pathname !== '/user/login' && !redirect) {
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      if(payload && payload.ok === false){
        return {
          ...state,
          status: "error",
          type: undefined,
        };
      }
      else {
        return {
          ...state,
          status: "ok",
          type: payload.type,
        };
      }
    },
  },
};

export default Model;
