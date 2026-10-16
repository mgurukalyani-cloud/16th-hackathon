import React from 'react';
import {
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudHail,
  Wind,
  Droplets
} from 'lucide-react';

const ICON_MAP = {
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudHail,
  Wind,
  Droplets
};

export default function WeatherIcon({ iconName = 'Cloud', className = 'w-6 h-6', animate = false }) {
  const IconComponent = ICON_MAP[iconName] || Cloud;

  let animClass = '';
  if (animate) {
    if (iconName === 'Sun' || iconName === 'SunMedium') {
      animClass = 'transition-transform hover:rotate-45 duration-700';
    } else if (iconName === 'CloudRain' || iconName === 'CloudDrizzle') {
      animClass = 'animate-bounce-subtle';
    }
  }

  return <IconComponent className={`${className} ${animClass}`} />;
}
