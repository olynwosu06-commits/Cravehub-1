require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./model/MenuItem');
const Group = require('./model/Group');
const Category = require('./model/Category');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const items = await MenuItem.find();
    console.log('Found ' + items.length + ' menu items.');

    const uniqueGroups = [...new Set(items.map(item => item.group).filter(Boolean))];
    console.log('Found groups: ' + uniqueGroups.join(', '));

    for (const groupName of uniqueGroups) {
      const exists = await Group.findOne({ name: groupName });
      if (!exists) {
        await Group.create({ name: groupName, icon: 'bx-food-menu' });
        console.log('Created Group: ' + groupName);
      }
    }

    for (const groupName of uniqueGroups) {
      const groupObj = await Group.findOne({ name: groupName });
      const groupCategories = [...new Set(
        items.filter(item => item.group === groupName).map(item => item.category).filter(Boolean)
      )];
      
      for (const catName of groupCategories) {
        const exists = await Category.findOne({ name: catName, group: groupObj._id });
        if (!exists) {
          await Category.create({ name: catName, group: groupObj._id });
          console.log('Created Category: ' + catName + ' (inside ' + groupName + ')');
        }
      }
    }

    console.log('Migration Complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
migrate();