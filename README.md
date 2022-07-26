# Briko Api

knex migrate:latest

knex seed:run

DB_TESTING=birko_automate_testing

mocha -r ts-node/register src/\*\*/app/**test**/email.spec.ts --timeout 40000

mocha -r ts-node/register src/\*\*/auth/**test**/**1**auth.login.spec.ts --timeout 40000

mocha -r ts-node/register src/\*\*/auth/**test**/**2**.auth.forgot.spec.ts --timeout 40000

mocha -r ts-node/register src/\*\*/auth/**test**/**3**.auth.refresh-token.spec.ts --timeout 40000

mocha -r ts-node/register src/\*\*/auth/**test**/**4**.auth.reset-password.spec.ts --timeout 40000

mocha -r ts-node/register src/\*\*/auth/**test**/**5**auth.logout.spec.ts --timeout 40000

mocha -r ts-node/register src/**/user/**test**/**1**user.profile.spec.ts --timeout 40000
mocha -r ts-node/register src/**/user/**test**/**2**user.me.spec.ts --timeout 40000
mocha -r ts-node/register src/\*\*/user/**test**/**3**user.setPassword.spec.ts --timeout 40000

mocha -r ts-node/register src/**/users/**test**/**1**users.list.spec.ts --timeout 40000
mocha -r ts-node/register src/**/users/**test**/**2**users.add.spec.ts --timeout 40000
mocha -r ts-node/register src/**/users/**test**/**3**users.update.spec.ts --timeout 40000
mocha -r ts-node/register src/**/users/**test**/**4**users.updateStatus.spec.ts --timeout 40000
mocha -r ts-node/register src/\*\*/users/**test**/**5**users.updateSetPassword.spec.ts --timeout 40000

mocha -r ts-node/register src/\*\*/teammembers/**test**/**1**.teammember.fetch.spec.ts --timeout 40000

mocha -r ts-node/register src/**/customers/**test**/**1**customer.add.spec.ts --timeout 40000
mocha -r ts-node/register src/**/customers/**test**/**2**customer.list.spec.ts --timeout 40000
mocha -r ts-node/register src/**/customers/**test**/**5**customer.updateStatus.spec.ts --timeout 40000
mocha -r ts-node/register src/**/customers/**test**/**4**customer.getCompanyDetail.spec.ts --timeout 40000
mocha -r ts-node/register src/\*\*/customers/**test**/**3**customer.editCompanyProfile.spec.ts --timeout 40000

mocha -r ts-node/register src/**/customers/**test**/**6**customer.addCustomerUser.spec.ts --timeout 40000
mocha -r ts-node/register src/**/customers/**test**/**7**customer.listCustomerUser.spec.ts --timeout 40000
mocha -r ts-node/register src/**/customers/**test**/**8**customer.updateCustomerUser.spec.ts --timeout 40000
mocha -r ts-node/register src/**/customers/**test**/**9**customer.customerUserChangeStatus.spec.ts --timeout 40000
mocha -r ts-node/register src/**/customers/**test**/**10**customer.customerUserChangeSetPassword.spec.ts --timeout 40000
mocha -r ts-node/register src/**/customers/**test**/**11**customer.customerOnSiteSystemData.spec.ts --timeout 40000

mocha -r ts-node/register src/\*\*/customers/**test**/**12**customer.customerFetch.spec.ts --timeout 40000

mocha -r ts-node/register src/**/documents/**test**/**1**documents.customerAddDocument.spec.ts --timeout 40000
mocha -r ts-node/register src/**/documents/**test**/**2**documents.documentList.spec.ts --timeout 40000
mocha -r ts-node/register src/**/documents/**test**/**3**documents.updateDocument.spec.ts --timeout 40000
mocha -r ts-node/register src/**/documents/**test**/**4**documents.deleteDocument.spec.ts --timeout 40000

mocha -r ts-node/register src/\*\*/documents/**test**/**5**documents.getCustomersForMoveDocument.spec.ts --timeout 40000

mocha -r ts-node/register src/\*\*/customers/**test**/**12**customer.customerFetch.spec.ts --timeout 40000

Prefences > settings > formatting > format on save

.vscode > settings.json

knex seed:run
