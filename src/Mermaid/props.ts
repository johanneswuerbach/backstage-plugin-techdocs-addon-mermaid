import mermaidAPI from 'mermaid/mermaidAPI';

/**
 * This type contains all the configuration of mermaid to be used as properties of the plugin.
 * @public
 */
export type MermaidProps = {
  config?: {
    theme?: mermaidAPI.Theme;
    logLevel?: mermaidAPI.LogLevel;
    securityLevel?: mermaidAPI.SecurityLevel;
    arrowMarkerAbsolute?: boolean;
    er?: {
      diagramPadding?: number,
      layoutDirection?: string,
      minEntityWidth?: number,
      minEntityHeight?: number,
      entityPadding?: number,
      stroke?: string,
      fill?: string,
      fontSize?: number,
      useMaxWidth?: boolean,
    },
    flowchart?: {
      diagramPadding?: number,
      htmlLabels?: boolean,
      curve?: string,
    },
    sequence?: {
      diagramMarginX?: number,
      diagramMarginY?: number,
      actorMargin?: number,
      width?: number,
      height?: number,
      boxMargin?: number,
      boxTextMargin?: number,
      noteMargin?: number,
      messageMargin?: number,
      messageAlign?: string,
      mirrorActors?: boolean,
      bottomMarginAdj?: number,
      useMaxWidth?: boolean,
      rightAngles?: boolean,
      showSequenceNumbers?: boolean,
    },
    gantt?: {
      titleTopMargin?: number,
      barHeight?: number,
      barGap?: number,
      topPadding?: number,
      leftPadding?: number,
      gridLineStartPadding?: number,
      fontSize?: number,
      fontFamily?: string,
      numberSectionStyles?: number,
      axisFormat?: string,
      topAxis?: boolean,
    },
    themeVariables?: {
      primaryColor?: string,
      contrast?: string,
      secondaryColor?: string,
      background?: string,
      tertiaryColor?: string,
      primaryBorderColor?: string,
      secondaryBorderColor?: string,
      tertiaryBorderColor?: string,
      noteBorderColor?: string,
      primaryTextColor?: string,
      secondaryTextColor?: string,
      tertiaryTextColor?: string,
      lineColor?: string,
      textColor?: string,
      altBackground?: string,
      mainBkg?: string,
      secondBkg?: string,
      border1?: string,
      border2?: string,
      note?: string,
      text?: string,
      critical?: string,
      done?: string,
      arrowheadColor?: string,
      fontFamily?: string,
      fontSize?: string,
      /* Flowchart variables */
      nodeBkg?: string,
      nodeBorder?: string,
      clusterBkg?: string,
      clusterBorder?: string,
      defaultLinkColor?: string,
      titleColor?: string,
      edgeLabelBackground?: string,
      /* Sequence Diagram variables */
      actorBorder?: string,
      actorBkg?: string,
      actorTextColor?: string,
      actorLineColor?: string,
      signalColor?: string,
      signalTextColor?: string,
      labelBoxBkgColor?: string,
      labelBoxBorderColor?: string,
      labelTextColor?: string,
      loopTextColor?: string,
      noteBkgColor?: string,
      noteTextColor?: string,
      activationBorderColor?: string,
      activationBkgColor?: string,
      sequenceNumberColor?: string,
      /* Gantt chart variables */
      sectionBkgColor?: string,
      altSectionBkgColor?: string,
      sectionBkgColor2?: string,
      excludeBkgColor?: string,
      taskBorderColor?: string,
      taskBkgColor?: string,
      taskTextLightColor?: string,
      taskTextColor?: string,
      taskTextDarkColor?: string,
      taskTextOutsideColor?: string,
      taskTextClickableColor?: string,
      activeTaskBorderColor?: string,
      activeTaskBkgColor?: string,
      gridColor?: string,
      doneTaskBkgColor?: string,
      doneTaskBorderColor?: string,
      critBkgColor?: string,
      critBorderColor?: string,
      todayLineColor?: string,
      /* C4 Context Diagram variables */
      personBorder?: string;
      personBkg?: string;
      /* state colors */
      labelColor?: string,
      errorBkgColor?: string,
      errorTextColor?: string,
    }
  }
};
