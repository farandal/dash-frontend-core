import { IAny } from '../misc/IAny';
import IModelField from './IModelField';

export default interface ISermecoopModel extends IAny {
	[key: string]: IModelField;
}
