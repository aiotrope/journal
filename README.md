# journal

Maintainer: [Arnel Imperial](https://github.com/aiotrope/)

Date: 16.10.2022 - 24.10.2022

## Part4: Testing Express servers, user administration

### Exercises

#### Branches

- [Solution for Exercise 4.1 - 4.2](https://github.com/aiotrope/journal/tree/4.1)

[Instruction link](https://fullstackopen.com/en/part4/structure_of_backend_application_introduction_to_testing#exercises-4-1-4-2)

- [Solution for Exercise 4.3 - 4.7](https://github.com/aiotrope/journal/tree/4.3)

[Instruction link](https://fullstackopen.com/en/part4/structure_of_backend_application_introduction_to_testing#exercises-4-3-4-7)

- [Solution for Exercise 4.8 - 4.12](https://github.com/aiotrope/journal/tree/4.8)

[Instruction link](https://fullstackopen.com/en/part4/testing_the_backend#exercises-4-8-4-12)

- [Solution for Exercise 4.13 - 4.14](https://github.com/aiotrope/journal/tree/4.13)

[Instruction link](https://fullstackopen.com/en/part4/testing_the_backend#exercises-4-13-4-14)

- [Solution for Exercise 4.15 - 4.23](https://github.com/aiotrope/journal/tree/4.15)

[Instruction link](https://fullstackopen.com/en/part4/token_authentication#exercises-4-15-4-23)

#### Summary of passes implemented tests

**base: /api**

##### File: tests/user.test.js

| Test description                                    | Method     | Response |
|-----------------------------------------------------|------------|----------|
| it can create new user                              | POST users | HTTP 201 |
| it checks for duplicate username as error           | POST users | HTTP 400 |
| it will fail on missing username                    | POST users | HTTP 400 |
| it will requires at least 3 chars long for username | POST users | HTTP 400 |
| it will fail on missing password                    | POST users | HTTP 400 |
| it will requires at least 3 chars long for password | POST users | HTTP 400 |
| it renders all users with 1 blog property defined   | GET users  | HTTP 200 |
| it can sign in registered user generates auth token | POST login | HTTP 200 |
| it should fail on missing/incorrect username        | POST login | HTPP 400 |
| it should fail on incorrect password                | POST login | HTTP 400 |
| it renders all blogs owned by registered users      | GET blogs  | HTTP 200 |

##### File: tests/blog.test.js

| Test description                                                                                | Method           | Response |
|-------------------------------------------------------------------------------------------------|------------------|----------|
| it return json-formatted blog list                                                              | GET blogs        | HTTP 200 |
| it returns all initialised blogs                                                                | GET blogs        | HTTP 200 |
| it retrieves a specified blog from the blog list                                                | GET blogs        | HTTP 200 |
| it returns error for accessing single blog with invalid blog id as param                        | GET blogs/:id    | HTTP 400 |
| it returns error for accessing single blog with non-existent blog id as param                   | GET blogs/:id    | HTTP 400 |
| it verifies that id property in response body is the unique identifier                          | GET blogs        | HTTP 200 |
| it checks that the saved blogs have a unique identifier known as id rather than _id             | GET blogs        | HTTP 200 |
| it checks if addition of blog is successful and all of the essential properties are defined     | POST blogs       | HTTP 201 |
| it checks if the posted blog has been added                                                     | GET blogs        | HTPP 200 |
| it checks to see if blank title fields will result into error response                          | POST blogs       | HTTP 400 |
| it verifies if blank url fields will give error response                                        | POST blogs       | HTTP 400 |
| it returns error for users attempting to create a blog without token                            | POST blogs       | HTTP 401 |
| it returns error response for using incorrect token                                             | POST blogs       | HTTP 401 |
| it can delete a specified blog, by the authenticated user who created the blog                  | DELETE blogs/:id | HTTP 200 |
| It should return an error if a user with a token attempts to delete a blog that they do not own | DELETE blogs/:id | HTTP 403 |
| it returns error for user without token to do a delete request                                  | DELETE blogs/:id | HTTP 401 |
| it returns errors for users using incorrect token                                               | DELETE blogs/:id | HTTP 401 |
| it returns error for using an invalid blog id as params                                         | DELETE blogs/:id | HTPP 401 |
| it returns error for using a non-existent blog id as params                                     | DELETE blogs/:id | HTTP 404 |
| it can update a blog (none token-based)                                                         | PATCH blogs/:id  | HTTP 200 |
| it can update only one field at a time e.g. likes only (none token-based)                       | PATCH blogs/:id  | HTTP 200 |
| it returns errors for using a non-existent blog id (none token-based)                           | PATCH blogs/:id  | HTTP 404 |
| it returns error for using an invalid blog id (none token-based)                                | PATCH blogs/:id  | HTTP 400 |