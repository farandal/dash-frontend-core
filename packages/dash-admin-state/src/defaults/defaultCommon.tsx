import ICommonState from "../redux/interfaces/ICommonState";

const defaultCommon: ICommonState = {
	error: '',
	loading: false,
	message: '',
	navExpanded: true,
	width: window.innerWidth,
	height: window.innerHeight,
	content_width: null,
	content_height: null,
	pathname: '/',
	componentsState: [],
	headerComponents: [],
	panelSettings: {
		horizontalLogo: <>🖥</>,
		squaredLogo: <>🖥</>,
	},
};

export default defaultCommon;
