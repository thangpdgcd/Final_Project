## 9. IMPLEMENTATION

### 9.1 Database

In the MStudent web application, **MySQL** is selected as the database management system to store and manage core data such as user accounts, courses, videos, comments/replies, orders, contact information, and access codes. This choice is appropriate for the system because:

- **Performance and reliability**: MySQL supports stable, high-performance query processing, helping the application respond quickly and maintain a smooth user experience.
- **Scalability**: the relational model and indexing support allow the database to scale as the volume of users and data grows, while keeping the structure flexible for future expansion.
- **Security and data integrity**: MySQL provides mechanisms for access control and maintaining data consistency, which is important for protecting user information and transaction-related data.
- **Good compatibility with Express/Node.js**: MySQL integrates well with the Express framework used for backend development, enabling an efficient and consistent development workflow.

The database is designed around key tables such as **Users**, **Courses**, **Videos**, and **Orders**. By using **foreign keys**, tables are connected based on business relationships, which improves data organization, supports consistent referencing, and makes queries more efficient and maintainable.

![Figure 40: Database MySQL](./assets/implementation-9-1.png)

At a high level, the main tables are described as follows:

- **Users**: stores user information including email, encrypted password, name details, address, phone number, gender, profile image, and role/position identifiers. Each user has a unique ID, which is used as a reference for related records across the system.
- **Courses**: contains course data such as course name, description, price, level, duration, number of lessons, and the owner/instructor (linked to Users). Each course is uniquely identified and can be associated with multiple videos.
- **Videos**: stores information about course videos such as title/name and the video link/source, and is linked to a specific course. This supports content delivery and course structure.
- **Contacts**: captures user contact and feedback information (e.g., email, full name, feedback content), supporting communication and customer support workflows.
- **Comments**: manages user comments associated with videos and users, enabling interaction and feedback within the learning platform.
- **Replies**: stores replies to comments to support threaded discussions, improving engagement and discussion structure.
- **Orders**: records purchasing/registration transactions, including user linkage and pricing totals, supporting payment tracking and order history.

This structure supports normalized storage, scalable growth, and efficient querying for the core features of the MStudent platform.

