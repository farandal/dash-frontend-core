import { SimpleLogger } from '../utils/SimpleLogger';

export const useLogger = (logger: string) => {
	const _logger = new SimpleLogger(logger, true);

	const log = (...any: any[]) => {
		_logger.log(any);
	};

	const info = (...any: any[]) => {
		_logger.log(any);
	};

	const error = (...any: any[]) => {
		_logger.error(any);
	};

	const warn = (...any: any[]) => {
		_logger.warn(any);
	};

	return { info, log, error, warn };
};
