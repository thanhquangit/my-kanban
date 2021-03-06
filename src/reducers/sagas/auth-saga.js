import {call, put} from 'redux-saga/effects';
import {API} from '../../api/index';
import {Actions} from '../../actions/index';


export function* login() {
  try {
    yield put(Actions.app.setFetching(true));
    const response = yield call(API.auth.firebaseLogin);
    const user = response.user;
    yield put(Actions.auth.saveCredential(user));

    // fetch all data
    yield put(Actions.project.pullAll());
    yield put(Actions.route.navigate('Dashboard', '/u'));

    yield put(Actions.app.setFetching(false));
  } catch (e) {
    yield put(Actions.app.setFetching(false));
    yield put(Actions.app.requireToast(e.message, 0));
  }
}

export function* logout() {
  try {
    yield put(Actions.app.setFetching(true));
    yield call(API.auth.firebaseLogout);
    yield put(Actions.auth.deleteCredential());
    yield put(Actions.app.deleteUserData());

    yield put(Actions.route.navigate('Home', '/'));

    yield put(Actions.app.setFetching(false));
  } catch (e) {
    yield put(Actions.app.setFetching(false));
    yield put(Actions.app.requireToast(e.message, 0));
  }
}
