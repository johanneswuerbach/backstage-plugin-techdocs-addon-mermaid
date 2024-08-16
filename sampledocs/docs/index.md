# Examples

# Combined Mermaid Diagram Example

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Continue]
    B -- No --> D[Fix it]
    D --> B
    C --> E[Finish]
```

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: I'm good thanks!
    Alice->>Bob: Great to hear
```

```mermaid
gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    Task 1           :a1, 2023-01-01, 30d
    Task 2           :after a1  , 20d
    Task 3           : 2023-02-11  , 20d
    Task 4           : 2023-02-21  , 20d
```

```mermaid
classDiagram
    class Animal {
      +String species
      +void eat()
    }
    class Dog {
      +String breed
      +void bark()
    }
    Animal <|-- Dog
```

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Working : start
    Working --> Idle : stop
    Working --> Failed : error
```

```mermaid
pie
    title Language Popularity
    "JavaScript" : 50
    "Python" : 25
    "Java" : 15
    "C++" : 10
```
