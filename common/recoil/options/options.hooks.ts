import { useRecoilValue } from 'recoil';
import { optionsAtom } from './options.atom';
import React from 'react'; // ✅ Ensure this is present

export const useOptions = () => {
  const options = useRecoilValue(optionsAtom);
  return options;
};
