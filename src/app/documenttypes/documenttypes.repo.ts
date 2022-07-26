import knex from 'knex';
const connection = require('../../config/database').Knex.config;
const db = knex(connection);
import log from '../../helper/logs';

class DocumentTypeRepo {

                getDocumentTypeFetchList(sql: any, sqlP: any, data:any ) {
                    return new Promise(function (resolve) {
                        
                        let user = db('document_types')
                        .select('id','documentTypeName')
                             .where(db.raw(sql, sqlP))
                            .orderBy(data.sortObject.column, data.sortObject.order)
                            .limit(data.pageLimit.limit)
                            .offset(data.pageLimit.offset)
                                   
                            .then(function (data: any) {
                               resolve(data)
                            })
                            .catch(function (error: any) {
                                log.info(['getCustomerFetchList', error.message])
                                resolve(null)
                            });
                    })
                }

                getDocumentTypeDetail(documentTypeId:number ) {
                    return new Promise(function (resolve) {
                        
                        let user = db('document_types')
                            .select('id','documentTypeName')
                             .where({"id":documentTypeId})
                             .first()
                            .then(function (data: any) {
                               resolve(data)
                            })
                            .catch(function (error: any) {
                                log.info(['getDocumentTypeDetail', error.message])
                                resolve(null)
                            });
                    })
                }
        

}
export default new DocumentTypeRepo();