# Rails DB Schema

Definition and Completion provider for Rails DB Schema.

## Features

### Completion

![Completion](https://i.gyazo.com/b096d87941300203e0d09f854862f9d8.gif)

![Validate](https://i.gyazo.com/0fc0f867fd597707d273ad6e9d95a3c6.gif)

### Definition

![Definition](https://i.gyazo.com/daa3e4f20fb4621b7037b87a292a588b.gif)

## Commands

### `railsDbSchema.open`

![open](https://i.gyazo.com/21fa4c33476b617460b2b7ae6019b114.gif)

### `railsDbSchema.insert`

![insert](https://i.gyazo.com/d3e25423f3381e7c48a044729046856d.gif)

## Tips

If you want to use this extension with the `config.active_record.schema_format = :sql` setting, you can add the following code to your `Rakefile` to make it work. ([\#8](https://github.com/aki77/vscode-rails-db-schema/issues/8))


```ruby
if Rails.env.development?
  %w[db:migrate db:rollback db:migrate:redo].each do |task_name|
    Rake::Task[task_name].enhance do
      schema_format = ActiveRecord.schema_format
      ActiveRecord.schema_format = :ruby
      Rake::Task['db:schema:dump'].invoke
      ActiveRecord.schema_format = schema_format
  end
end
```

## TODO

- [x] `Model.human_attribute_name` completion
- [ ] Test
