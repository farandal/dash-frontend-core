import createSagaMiddleware from 'redux-saga';
import { applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import rootSaga from '../sagas/index';
import createRootReducer from '../reducers';
import { createBrowserHistory } from 'history';
import { legacy_createStore as createStore } from 'redux';
import { thunk } from 'redux-thunk';

export const history = createBrowserHistory();
const routeMiddleware = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();

const middlewares = [thunk, sagaMiddleware, routeMiddleware];

export const configureStore = (preloadedState?: {}) => {
	const store = createStore(
		createRootReducer(/*history*/), // root reducer with router state
		preloadedState,
		compose(
			applyMiddleware(
				routerMiddleware(history), // for dispatching history actions
				...middlewares as any[],
			),
		),
	);

	sagaMiddleware.run(rootSaga, {});

	return store;
};

export default configureStore;
