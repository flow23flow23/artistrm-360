import { useEffect, useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Hook personalizado para gestionar interfaces responsivas
 * Proporciona información sobre el tamaño de pantalla actual y utilidades para adaptar la UI
 */
export const useResponsiveUI = () => {
  const theme = useTheme();
  
  // Detectar tamaños de pantalla usando breakpoints de Material UI
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  // Estado para orientación en dispositivos móviles
  const [isPortrait, setIsPortrait] = useState(true);
  
  // Estado para detectar si es un dispositivo táctil
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Detectar cambios de orientación
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    // Detectar orientación inicial
    handleOrientationChange();
    
    // Escuchar cambios de orientación
    window.addEventListener('resize', handleOrientationChange);
    
    // Detectar si es un dispositivo táctil
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);
  
  /**
   * Devuelve un valor basado en el tamaño de pantalla actual
   * @param mobileValue Valor para móviles
   * @param tabletValue Valor para tablets
   * @param desktopValue Valor para escritorio
   * @param largeDesktopValue Valor para pantallas grandes
   * @returns El valor correspondiente al tamaño de pantalla actual
   */
  const responsiveValue = <T>(
    mobileValue: T,
    tabletValue: T = mobileValue,
    desktopValue: T = tabletValue,
    largeDesktopValue: T = desktopValue
  ): T => {
    if (isMobile) return mobileValue;
    if (isTablet) return tabletValue;
    if (isLargeDesktop) return largeDesktopValue;
    return desktopValue;
  };
  
  /**
   * Calcula el número de columnas para grids basado en el tamaño de pantalla
   * @param minCols Mínimo número de columnas (móvil)
   * @param maxCols Máximo número de columnas (escritorio grande)
   * @returns Número de columnas apropiado para el tamaño actual
   */
  const getGridColumns = (minCols: number = 1, maxCols: number = 4): number => {
    return responsiveValue(minCols, Math.min(minCols + 1, maxCols), Math.min(minCols + 2, maxCols), maxCols);
  };
  
  /**
   * Calcula el tamaño de fuente responsivo
   * @param baseFontSize Tamaño base en rem
   * @param scaleFactor Factor de escala entre dispositivos
   * @returns Tamaño de fuente apropiado para el dispositivo actual
   */
  const getResponsiveFontSize = (baseFontSize: number, scaleFactor: number = 0.25): string => {
    const size = isMobile 
      ? baseFontSize 
      : isTablet 
        ? baseFontSize + scaleFactor 
        : isLargeDesktop 
          ? baseFontSize + (scaleFactor * 3) 
          : baseFontSize + (scaleFactor * 2);
    
    return `${size}rem`;
  };
  
  /**
   * Calcula el espaciado responsivo
   * @param baseSpacing Espaciado base en unidades de theme.spacing
   * @param scaleFactor Factor de escala entre dispositivos
   * @returns Espaciado apropiado para el dispositivo actual
   */
  const getResponsiveSpacing = (baseSpacing: number, scaleFactor: number = 1): number => {
    return responsiveValue(
      baseSpacing,
      baseSpacing + scaleFactor,
      baseSpacing + (scaleFactor * 2),
      baseSpacing + (scaleFactor * 3)
    );
  };
  
  /**
   * Determina si se debe mostrar una versión simplificada de la UI
   * @param threshold Umbral de complejidad (0-1)
   * @returns true si se debe mostrar una versión simplificada
   */
  const shouldSimplifyUI = (threshold: number = 0.7): boolean => {
    if (isMobile) return true;
    if (isTablet && threshold < 0.5) return true;
    return false;
  };
  
  return {
    // Información de dispositivo
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isPortrait,
    isTouchDevice,
    
    // Utilidades
    responsiveValue,
    getGridColumns,
    getResponsiveFontSize,
    getResponsiveSpacing,
    shouldSimplifyUI,
    
    // Acceso directo a breakpoints
    breakpoints: theme.breakpoints
  };
};

export default useResponsiveUI;
