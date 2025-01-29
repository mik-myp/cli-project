module.exports = (app) => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ProjectSchema = new Schema({
    name: { type: String },
    value: { type: String },
    version: { type: String },
    npmName: { type: String },
  });

  return mongoose.model("project", ProjectSchema);
};
