import logger from "../config/logger";

class Logs {
  /**
   * Log info..
   * @param winstonMSG 
   */
  info(winstonMSG: any) {
    if (typeof winstonMSG == 'object') {
      winstonMSG = JSON.stringify(winstonMSG);
    }
    logger.info(winstonMSG);
  }

  /**
   * Log errors..
   * @param winstonMSG 
   */
  error(winstonMSG: any) {
    if (typeof winstonMSG == 'object') {
      winstonMSG = JSON.stringify(winstonMSG);
    }
    logger.error(winstonMSG);
  }
}

export default new Logs();