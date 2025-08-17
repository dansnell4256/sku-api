Project Notes

1. Typescript was selected because I have worked with it and prefer the typing over straight JS
2. the js files created go in a build folder to not clutter the project.  These are also excluded from being committed.
3. The functional automation is in the API test location to keep it distnict from any unit tests that would be created.
4. For simplicity sake running this locally a simple json file is used as the data store.
5. In the initial implimentation UUIDs were selected for ease of uniqueness. (REMOVED)
6. Potential change - in the design signiture the price was defined as a string.  It may be a better practice instead to store this as a number type.
7. removed id and went with sku as unique for now.  In a production platform with a backing db we may want to look at some level of integer id for performance.
8. selected Jest as the test execution framework.  It reads well, the performance is solid for what we are doing along with a well supported echosystem.

Test Design
1. The test will have a precreated json file that contains data.  This data file will be reset for each test.  This will establish a known baseline regardless of the order that the tests are executed in.
2. A new npm command 'npm run api-test' will build an execute the functional automation.  The command 'npm run test' will still be reserved for unit tests.
3. Tests:
    - Each endpoint will have a core set of positive case tests.
    - Each endpoint will excercise the non 500 error scenarios cases.
    - Negative scenarios covered:
        GET - No data returns empty array for a get all
        GET - invalid sku returns 404
        POST - duplicate submission of same sku
        POST - invalid payload submission
        DELETE - invlid ID

4. Max worker threads set to 1 for Jest execution to avoid resource collisions around the data files.  This resulted in a 1 second time increase in execution time, but avoids race conditions on the data file.


