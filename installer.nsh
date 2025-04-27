!macro customInstall
  ; Undefine existing variables first
  !undef MUI_BGCOLOR
  !undef MUI_TEXTCOLOR
  
  ; Now redefine them
  !define MUI_BGCOLOR 0xFFFFFF  ; Background color (in hexadecimal)
  !define MUI_TEXTCOLOR 0x000000  ; Text color (in hexadecimal)
  
  ; Additional NSIS customizations can go here
!macroend