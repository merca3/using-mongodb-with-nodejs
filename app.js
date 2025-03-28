const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const circulationRepo = require("./repos/circulationRepo");
const data = require("./circulation.json");

const url = "mongodb://localhost:27017";
const dbName = "circulation";

async function main() {
  const client = new MongoClient(url);

  try {
    await client.connect();

    // loadData
    const results = await circulationRepo.loadData(data);
    assert.equal(data.length, results.insertedCount);

    // get
    const getData = await circulationRepo.get();
    assert.equal(data.length, getData.length);

    const filterData = await circulationRepo.get({
      Newspaper: getData[4].Newspaper,
    });
    assert.deepEqual(filterData[0], getData[4]);

    const limitData = await circulationRepo.get({}, 3);
    assert.equal(limitData.length, 3);

    // getById
    const id = getData[4]._id.toString();
    const byId = await circulationRepo.getById(id);
    assert.deepEqual(byId, getData[4]);

    // add
    const newItem = {
      Newspaper: "My paper",
      "Daily Circulation, 2004": 1,
      "Daily Circulation, 2013": 2,
      "Change in Daily Circulation, 2004-2013": 100,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 0,
    };
    const addedItem = await circulationRepo.add(newItem);
    assert(addedItem._id);
    const addedItemQuery = await circulationRepo.getById(addedItem._id);
    assert.deepEqual(addedItemQuery, newItem);

    // update
    const updatedItem = await circulationRepo.update(addedItem._id, {
      Newspaper: "My new paper",
      "Daily Circulation, 2004": 1,
      "Daily Circulation, 2013": 2,
      "Change in Daily Circulation, 2004-2013": 100,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 0,
    });
    assert.equal(updatedItem.Newspaper, "My new paper");

    // remove
    const removed = await circulationRepo.remove(addedItem._id);
    assert(removed);
    const deletedItem = await circulationRepo.getById(addedItem._id);
    assert.equal(deletedItem, null);

    // averageFinalists
    const avgFinalists = await circulationRepo.averageFinalists();
    console.log("Average Finalists: " + avgFinalists);

    // averageFinalistsByChange
    const avgByChange = await circulationRepo.averageFinalistsByChange();
    console.log("Average Finalists By Change: ");
    console.log(avgByChange);
  } catch (error) {
    console.log(error);
  } finally {
    const admin = client.db(dbName).admin();

    await client.db(dbName).dropDatabase();
    console.log(await admin.listDatabases());

    client.close();
  }
}

main();
