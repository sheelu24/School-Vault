CREATE TABLE books (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255)    NOT NULL,
    author          VARCHAR(255)    NOT NULL,
    isbn            VARCHAR(32)     NOT NULL,
    category        VARCHAR(100),
    total_copies    INT             NOT NULL DEFAULT 0,
    available_copies INT            NOT NULL DEFAULT 0,
    shelf_location  VARCHAR(64),
    deleted         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_books_isbn UNIQUE (isbn),
    CONSTRAINT ck_books_total_copies CHECK (total_copies >= 0),
    CONSTRAINT ck_books_available_copies CHECK (available_copies >= 0)
);

CREATE INDEX idx_books_title ON books (title);
CREATE INDEX idx_books_author ON books (author);
CREATE INDEX idx_books_category ON books (category);
CREATE INDEX idx_books_deleted ON books (deleted);

CREATE TABLE members (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(150)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    phone       VARCHAR(32),
    status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_members_email UNIQUE (email)
);

CREATE INDEX idx_members_status ON members (status);
CREATE INDEX idx_members_name ON members (name);

CREATE TABLE transactions (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    book_id     BIGINT      NOT NULL,
    member_id   BIGINT      NOT NULL,
    issued_at   TIMESTAMP   NOT NULL,
    due_date    TIMESTAMP   NOT NULL,
    returned_at TIMESTAMP   NULL,
    status      VARCHAR(20) NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tx_book FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT fk_tx_member FOREIGN KEY (member_id) REFERENCES members (id)
);

CREATE INDEX idx_tx_book ON transactions (book_id);
CREATE INDEX idx_tx_member ON transactions (member_id);
CREATE INDEX idx_tx_status ON transactions (status);
CREATE INDEX idx_tx_due_date ON transactions (due_date);
