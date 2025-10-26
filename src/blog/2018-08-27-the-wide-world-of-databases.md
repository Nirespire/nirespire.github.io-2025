---
title: "The Wide World of Databases"
date: 2018-08-27
layout: layouts/post.njk
coverImage: https://cdn-images-1.medium.com/max/1200/0*fBpXznzmVndvFJCo
coverImageAlt: "Photo by Jonathan Singer on Unsplash"
tags: ["databases", "software engineering", "technology"]
---

Working in software, it's easy to get caught up in all the latest and greatest technologies and frameworks. Every other week there seems to be a new JavaScript framework that "solves" all your problems. However, one of the most fundamental pieces of any non-trivial application is how you store and retrieve your data, i.e. your database.

In this post, I'll go over some of the most common types of databases you might encounter in modern software development and what makes them unique.

## Relational Databases

*Probably what they're teaching at school.*

The trusty relational database (RDB) is usually the first thing you encounter if you take the traditional, academic avenue into software development. This is very much on purpose, as shown by the StackOverflow Developer Skills Survey from 2018, four out of the five most used database technologies by all respondents were RDBs (excluding MongoDB).

![Source: https://insights.stackoverflow.com/survey/2018/#technology-databases](https://cdn-images-1.medium.com/max/800/1*GtHSGssY-c-WBOY0hsbcpA.png)

If you're planning on taking your learned skills from school into industry, you're probably going to need to know something about RDBs.

RDBs are designed around the mathematical concepts of [relational algebra](https://en.wikipedia.org/wiki/Relational_algebra). Everything you can do in a RDB can be modeled with a relational algebra expression. The SQL query language is designed after these expressions and provides a pretty simple interface to interact with data. Efficiently organizing your data requires following the rules of [normalization](https://en.wikipedia.org/wiki/Database_normalization) or the normal forms. Each entry is identified by a **primary key** with data structured into **tables** that can be joined together.

RDBs have been around quite a long time ([back in the 1970s](http://www-03.ibm.com/ibm/history/ibm100/us/en/icons/reldb/)) and are very good for general purpose data access patterns for applications. As a result, they are often the go-to choice for general application workloads for the web and enterprises.

**Why they're good:**

- Commonly used around industry with wide support
- Very efficient and fast if following well established practices for modeling data and systems administration
- Great for simple application workloads like writing and reading small chunks of data on well-defined identifiers or keys
- Usually [ACID](https://en.wikipedia.org/wiki/ACID_%28computer_science%29) compliant, meaning they provide strong guarantees about the integrity of your data

**Why they're not so good:**

- Typically, relational models of data are hard to change once they're heavily in use, limiting effectiveness when building fast-changing POCs
- Running through very large sets of data for aggregations can be very inefficient
- Performing "fuzzy" queries when a key or search query isn't well-defined
- Horizontal scalability isn't usually built into the implementations and are usually achieved through some higher level abstraction layer. You might find real-world implementations to be very monolithic as a result.

**Some Examples:**

- [MySQL](https://www.mysql.com/) — Free, opensource, [used widely at Uber](https://www.mysql.com/customers/view/?id=1269)
- [Postgres](https://www.postgresql.org/) — Free, opensource, also widely used in industry
- SQLite — Free, opensource, stores all its data in a single file, commonly used in embedded applications like smartphones
- [IBM DB2](https://www.ibm.com/analytics/us/en/db2/)
- [OracleDB](https://www.oracle.com/database/index.html)

## Document Databases

*You've heard of MongoDB, right?*

Document databases usually fall under the umbrella of NoSQL databases. They typically don't follow concepts of relational algebra in their design and you usually don't interact with them through SQL. The rules as to how to define a data model are a lot more flexible. Each entry in your database is a **document**, which is usually just a JSON object stored as binary data with an associated key. You can group your documents into logical **collections** where there's no strict requirement about how the data in each collection or even adjacent documents can look. It works well for simple, flat data that is read and written in simple patterns.

**Why they're good:**

- No predefined schema means it is really easy to get up and running when building POCs or test applications
- Use-cases outside of simple reads and writes, like search queries
- Easier to horizontally scale through multiple nodes since collections and documents do not share any strict data relation
- Storing simple, contiguous, independent entities of data

**Why they're not so good:**

- Complex queries that filter on multiple values across documents or collections
- Data that has a lot of relationships and links. Check out this [article](https://hackernoon.com/the-problem-with-mongodb-d255e897b4b) for more about that
- Many implementations do not provide ACID guarantees

**Some Examples:**

- [MongoDB](https://www.mongodb.com/) — Opensource, probably the most recognizable brand in document databases
- [Couchbase](https://www.couchbase.com/)
- [Elasticsearch](https://www.elastic.co/) — Opensource, used for common search workloads
- [RethinkDB](https://www.rethinkdb.com/) — Opensource, realtime database for online applications

## Key Value Stores

*Basically a really, really sophisticated hash map.*

Key value stores or KV stores are commonly used when your data needs are simple enough that you can boil them down to querying for a **key** and getting your data **value** back. No relations or extra logic needed. This pattern can be applied to persistent data on disk, or temporary stores used as caches for increased performance and availability. Once again, KV stores fall under the NoSQL umbrella of databases because their storage and access designs don't follow any relational models.

Some example use-cases include Redis, which is a popular in-memory KV datastore commonly used as a caching mechanism in applications. Since it stores all its data in memory by default, it gets the benefits of performance while lacking any guarantee the data will be preserved after it is shut down. For example, if an application is commonly querying a disk-based database for the same few entries, it might get them from disk once, then store those entries by key in Redis so it could retrieve them faster next time. If Redis goes down or the application restarts, the only cost would be a slower first retrieval of the data.

**Why they're good:**

- Super fast performance
- Highly scalable
- Great as a supporting datastore for application workloads to improve performance

**Why they're not so good:**

- Inefficient at anything other that looking up data by keys
- Bad performance on complex queries or searches
- In-memory implementations are not designed to be the primary datastore for applications

**Some Examples:**

- [Redis](https://redis.io/) — Popular in-memory KV store
- [Memcached](https://memcached.org/)
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/) — Amazon's managed, highly scalable KV store in the cloud

## Column-Oriented Databases

*So, imagine a relational database…but sideways.*

To explain column-oriented databases (yet another NoSQL set of databases), let's first see how data is stored on disk for this kind of database vs. the more common, row-oriented design. Below is a comparison of what data stored in a row-oriented vs column-oriented system would look like on disk:

![Either rows or columns are placed close together on disk](https://cdn-images-1.medium.com/max/800/1*_N-W-v98jMESdqsWL1d3gA.png)

The performance of a database operation is largely depending on physical proximity of data, whether on a spinning hard disk or between nodes in a cluster. The immediate side effect of organizing column data close together is that queries over a full row become less efficient in favor of queries over a full column. Each row typically has a **row key**, however the data is queried using the column values rather than keys on the rows. Some implementations group column key's or **column qualifiers** into **column families** to more easily group similar sets of data.

As a result, column-oriented databases fall into some very specific application use-cases, mostly dealing with online analytical processing (OLAP) workloads rather than typical transactional workloads.

**Why they're good:**

- Great for big data and data analytics applications
- Running aggregation querying over very large data sets
- Efficient storing and querying of timeseries data
- Highly scalable depending on the layout of the data in the system
- Compression of data entries per column since the data is all structured the same

**Why they're not so good:**

- Inefficient for querying over a small, disparate sets of rows
- Online transaction processing (OLTP) workloads, typical for user-facing applications, are very inefficient
- Performance is highly dependent on key and data layout design. Google provides their own [analysis tool](https://cloud.google.com/bigtable/docs/keyvis-overview) just so customers of their column databases can better design their keys

**Some Examples:**

- [Google Cloud Big Table](https://cloud.google.com/bigtable/) — Google's column oriented database as a service
- [Amazon Redshift](https://aws.amazon.com/redshift/) — Amazon's version
- [Apache HBase](https://hbase.apache.org/) — An open source alternative to the proprietary implementations

## Graph Databases

*We're all connected*

The Graph we're dealing with here is the computer science version, i.e with one composed of vertices and edges. Graph databases take those same concepts and rename them to **nodes** and **relationships**. Simply put, graph databases represent data in nodes that are linked together using relationships. An obvious real-world use of a graph database would be for modeling social networks, where nodes are users and relationships are the links created between users like becoming friends.

With these storage capabilities comes all the benefits that has come from the mathematics around graphs, including efficient graph traversal and analysis algorithms. If you find yourself thinking about your data like a network of connected nodes, a graph database would probably provide the easiest abstraction with plenty of sophisticated methods of interaction.

**Why they're good:**

- Good at representing complex relations between data
- Can deal with constantly changing relationship structures between data

**Why they're not so good:**

- Can only query data based on anything other than relationships
- Slow at storing and querying large amounts of data for OLAP applications
- Not efficient at running algorithms on the data that are not optimized for graph data structures

**Some Examples:**

- [Neo4j](https://neo4j.com/) — A lot of what you will read about graph DBs will usually end up here

## Misc

I did want to mention [CockroachDB](https://www.cockroachlabs.com/) and Google [Cloud Spanner](https://cloud.google.com/spanner/). Both are pitched as a database with a relational model that comes with all the benefits of ACID compliance while also having potential to scale to massive workloads. Spanner was introduced by Google as the first publicly available, managed service on the Google Cloud Platform to offer such stellar availability and performance from a ACID compliant RDB. CockroachDB came onto the scene not too long after as the opensource alternative that advertised the same benefits. Both are ultimately RDBs with some significant enhancements to enable some horizontal scalability that would otherwise not be straightforward with other RDB implementations.

### Conclusion

With these quick summaries and reference links, I hope you are better informed about the varied world of database solutions out there. Try your hand at getting one of them up and running and using it for your next personal project. Get familiar with the nuances of working with data between the different paradigms. Reconsider where and how the online data you see everyday is stored and retrieved.