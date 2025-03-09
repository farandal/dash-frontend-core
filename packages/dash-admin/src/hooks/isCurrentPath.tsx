import IMenuItem from "../interfaces/navigation/IMenuItem";

const isCurrentPath = (path: string, item: IMenuItem): boolean => {
	let _return = false;
	let _path = path;

	if (_path === (item as IMenuItem).to) return true;

	while (_path.charAt(0) === '/') {
		_path = _path.substring(1);
	}

	if ((item as IMenuItem).children) {
		(item as IMenuItem).children.forEach((i) => {
			if (i.model === _path) _return = true;
		});
	}

	return _return;
};

export default isCurrentPath;
