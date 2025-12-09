/**
 * GlobalLoader Component
 * A loading overlay component that displays when data is loading
 */
import React from 'react';
import LoaderAnimation from 'react-spinners/ScaleLoader';
import LoadingOverlay from 'react-loading-overlay-ts';
import useGlobalLoaderMgr from 'dash-admin/src/hooks/useGlobalLoaderMgr';

interface IGlobalLoader {
  color?: string;
  size?: number;
}

const GlobalLoader: React.FC<IGlobalLoader> = ({ color = "#EEE", size = 10, ...props }) => {
  const [loading] = useGlobalLoaderMgr();

  return loading ? (
    <LoadingOverlay
      active={loading}
      styles={{
        wrapper: {
          width: '100%',
          height: '100%',
          overflow: loading ? 'hidden' : 'scroll',
        },
        overlay: (base) => ({
          ...base,
          background: 'rgba(255, 255, 255, 0.5)',
        }),
      }}
      spinner={
        <LoaderAnimation
          height={size}
          width={4}
          color={color}
          loading={loading}
        />
      }
    />
  ) : <></>;
};

export default GlobalLoader;
