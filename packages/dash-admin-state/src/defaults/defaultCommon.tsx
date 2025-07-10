import ICommonState from "../redux/interfaces/ICommonState";

const defaultCommon: ICommonState = {
  appPath: '/', // Added missing property
  error: '',
  loading: false,
  message: '',
  navExpanded: true,
  width: window.innerWidth,
  height: window.innerHeight,
  content_width: null,
  content_height: null,
  pathname: '/',
  componentsState: {}, // Changed from [] to {}
  headerComponents: [],
  panelSettings: {
    horizontalLogo: <>🖥</>,
    squaredLogo: <>🖥</>,
  },
  navSize: "small"
};

export default defaultCommon;
