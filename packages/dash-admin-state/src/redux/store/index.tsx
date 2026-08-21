import createSagaMiddleware from 'redux-saga';
import { applyMiddleware, compose } from 'redux';
import rootSaga from '../sagas/index';
import createRootReducer from '../reducers';
import { createBrowserHistory } from 'history';
import { legacy_createStore as createStore } from 'redux';
import { thunk } from 'redux-thunk';

export const history = createBrowserHistory();
const sagaMiddleware = createSagaMiddleware();

const middlewares = [thunk, sagaMiddleware];

export const configureStore = (preloadedState?: {}) => {
	const store = createStore(
		createRootReducer(/*history*/), // root reducer with router state
		preloadedState,
		compose(
			applyMiddleware(
				...middlewares as any[],
			),
		),
	);

	sagaMiddleware.run(rootSaga, {});

	return store;
};

export default configureStore;
