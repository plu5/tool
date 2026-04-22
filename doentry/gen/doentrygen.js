let template = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">
<plist version=\"1.0\">
<dict>
	<key>Activity</key>
	<string>Stationary</string>
	<key>Creation Date</key>
	<date>{date}</date>
	<key>Entry Text</key>
	<string># {n}{heading}

■</string>
	<key>Starred</key>
	<false />
	<key>UUID</key>
	<string>{uuid}</string>
	<key>Creator</key>
	<dict>
		<key>Device Agent</key>
		<string>PC</string>
		<key>Generation Date</key>
		<date>{date}</date>
		<key>Host Name</key>
		<string>Unknown (Browser)</string>
		<key>OS Agent</key>
		<string>{os}</string>
		<key>Software Agent</key>
		<string>doentrygen.js</string>
	</dict>
</dict>
</plist>
`;

const populate = (before, after) => {
  template = template.replaceAll(before, after);
};

const now = new Date();
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

populate("{date}", now.toISOString().slice(0, -5) + "Z");
populate(
  "{heading}",
  ` | ${now.toISOString().slice(0, -14)} ${days[now.getDay()]}`);
populate("{uuid}", crypto.randomUUID().replaceAll("-", "").toUpperCase());
populate("{os}", navigator.userAgent);

document.getElementById("output").textContent = template;
