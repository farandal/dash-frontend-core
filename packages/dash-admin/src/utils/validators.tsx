export const RutValidator = (value) => {

    const hasDot = value.includes('.') ? true : false;
    if(hasDot) {
      return /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/.test(value);
    }
  
      const dv = (T) => {
          var M = 0,
              S = 1;
          for (; T; T = Math.floor(T / 10)) S = (S + (T % 10) * (9 - (M++ % 6))) % 11;
          return S ? S - 1 : 'k';
      };
  
      if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(value)) {
          return false;
      }

      // @ts-ignore
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
          return true;
      }
  
      let tmp = value.split('-');
      let digv = tmp[1];
      let rut = tmp[0];
  
      if (digv == 'K') {
          digv = 'k';
      }
  
      return dv(rut) == digv;
  
  };

export const RutValidatorWithoutDots = (value) => {

    /*

    77317330-8
    77317331-6
    77317332-4
    77317333-2
    77317334-0
    77317335-k
    77317336-9
    77317337-7
    77317338-5
    77317339-3

    */

  if (!value) return false;

  // Must be numbers + single dash + digit or K/k
  if (!/^[0-9]+-[0-9kK]{1}$/.test(value)) {
    return false;
  }

    const dv = (T) => {
          var M = 0,
              S = 1;
          for (; T; T = Math.floor(T / 10)) S = (S + (T % 10) * (9 - (M++ % 6))) % 11;
          return S ? S - 1 : 'k';
      };
  
      if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(value)) {
          return false;
      }
  
      // @ts-ignore
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
          return true;
      }
  
      let tmp = value.split('-');
      let digv = tmp[1];
      let rut = tmp[0];
  
      if (digv == 'K') {
          digv = 'k';
      }
  
      return dv(rut) == digv;
  
      
};



  const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  export const EmailValidator = (value) => {
    return EMAIL_REGEX.test(value);
  };
  
  