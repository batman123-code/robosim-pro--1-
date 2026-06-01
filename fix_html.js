const fs = require("fs");

function fix(f) {
  let content = fs.readFileSync(f, "utf8");
  const index = content.indexOf("</html>");
  if (index !== -1) {
    content = content.substring(0, index + 7);
    fs.writeFileSync(f, content);
  }
}

fix("donate.html");
fix("donation-success.html");
