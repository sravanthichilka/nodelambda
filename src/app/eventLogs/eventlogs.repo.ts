import { anyLogEventInterface } from "../../customEvents/customEventInterface";
import logsModal from "../../mongo_model/logsModal";

class UserRepo {
  async getDocumentTypeFetchList(
    conditionObject: object,
    sortObject: Record<string, 1 | -1>,
    currentPage: number,
    recordPerPage: number
  ) {
    const skip: number = recordPerPage * currentPage - recordPerPage;
    const limit: number = recordPerPage;

    const recordDetail = await logsModal.aggregate([
      { $match: conditionObject },
      { $sort: sortObject },
      {
        $facet: {
          totalRecordCount: [{ $count: "count" }],
          records: [
            { $skip: skip },
            { $limit: limit },

            {
              $project: {
                userId: 1,
                userName: 1,
                eventMessage: 1,
                eventTypeId: 1,
                eventTypeLabel: 1,
                userAgent: 1,
                createdAt: 1,
                updatedAt: 1,
                changes: 1,

                userRoleId: 1,
                alterRecordUserRoleId: 1,
                companyId: 1,
                companyName: 1,
                documentId: 1,
                documentName: 1,
              },
            },
          ],
        },
      },
    ]);

    return {
      totalRecord: recordDetail[0]["records"],
      totalRecordCount:
        recordDetail[0]["totalRecordCount"][0] && recordDetail[0]["totalRecordCount"][0]["count"]
          ? recordDetail[0]["totalRecordCount"][0]["count"]
          : 0,
    };
  }

  async getDocumentTypeFetchCount(conditionObject: object, sortObject: { [key: string]: number }) {
    return await logsModal.countDocuments(conditionObject).sort(sortObject);
  }

  async getEventLogDetail(eventTypeLogId: string): Promise<anyLogEventInterface> {
    return <anyLogEventInterface>await logsModal.findById(eventTypeLogId).populate("changes");
  }
}
export default new UserRepo();
