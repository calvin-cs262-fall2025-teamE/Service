import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Community API running on port ${port}`));
app.get("/", (req, res) => {
  res.send("Comm-Unity API is alive");
});