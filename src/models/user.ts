import { Effect, Reducer } from 'umi';

import { queryCurrent, query as queryUsers } from '@/services/user';
import { setAuthority } from '@/utils/authority';

export interface CurrentUser {
  avatar?: string;
  name?: string;
  title?: string;
  group?: string;
  signature?: string;
  tags?: {
    key: string;
    label: string;
  }[];
  userid?: string;
  unreadCount?: number;
}

export interface UserModelState {
  currentUser?: CurrentUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      /* Server side user DTO structure
      public class UserDetails
      {
          public string Id { get; set; }
          public string Email { get; set; }
          public string PhoneNumber { get; set; }
          public IList<string> Roles { get; set; }
          public string UserName { get; set; }
          public string FirstName { get; set; }
          public string LastName { get; set; }
          public int Level { get; set; }
          public DateTime JoinDate { get; set; }
      }
      */

      if(response.Roles.indexOf("SuperAdmin") > -1 || response.Roles.indexOf("Admin") > -1){
        setAuthority("admin");
      }
      else{
        setAuthority("user");
      }

      let currentUser = {          
        // Can reference to the mock up data for a user data structure
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        name: response.FirstName + ' ' + response.LastName,
        title: response.UserName,
        userid: response.Id
      };

      yield put({
        type: 'saveCurrentUser',
        payload: currentUser,
      });
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

export default UserModel;
