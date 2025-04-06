---
title: "The Wide World of Databases"
date: 2018-08-27
layout: layouts/base.njk
tags: 
  - databases
  - software-development
  - technology
---

Working in software, it's easy to get caught up in all the latest and greatest technologies and frameworks. Every other week there seems to be a new JavaScript framework that "solves" all your problems. However, one of the most fundamental pieces of any non-trivial application is how you store and retrieve your data, i.e. your database.

In this post, I'll go over some of the most common types of databases you might encounter in modern software development and what makes them unique.

## Relational Databases

The most common type of database you'll encounter is a relational database. These have been around for decades and are battle tested in production environments across countless applications. Some popular examples include:

- PostgreSQL
- MySQL
- Oracle
- Microsoft SQL Server

The defining characteristic of relational databases is that they store data in tables with predefined schemas. Each table represents a different type of data (e.g. Users, Products, Orders) and relationships between these tables are established through foreign keys.

// ... rest of content converted to markdown ...