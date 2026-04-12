# Public Images Directory

This directory contains static assets that are part of the application's core UI (logos, favicons, default placeholders).

### Static Assets
- `dmga-logo.png`: Main brand logo used in the navbar.
- `favicon.png`: Website favicon.
- `userPlaceHolder.jpg`: Default image for members/users without a photo.

### Dynamic Content
Most images on the website (Hero Banners, Assembly Photos, Media Gallery) are **not stored here**. They are:
1.  **Uploaded** via the `/admin` dashboard.
2.  **Stored** in Cloudinary.
3.  **Managed** dynamically through the PostgreSQL database.

For more information, refer to the [Design Guide](../../DESIGN_GUIDE.md).
