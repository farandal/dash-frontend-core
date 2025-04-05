import  { AxiosError } from 'axios';

export interface IDashAutoAdminBackendError {
  status:        number;
  body:          Body;
  resource:      string;
  originalError: AxiosError<IDashAutoAdminDefaultBackendStructure>;
}

export interface IDashAutoAdminDefaultBackendStructure {
  message: string;
  errors:  {
    [key: string]: string[];
  };
}

interface Body {
  [x:string]: any
}

