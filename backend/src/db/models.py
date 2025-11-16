from pydantic import BaseModel

class CreateCollectionData(BaseModel):
    collection: str
    create_data: dict

class GetCollectionData(BaseModel):
    collection: str = None
    filter: dict

class UpdateCollectionData(BaseModel):
    collection: str
    filter: dict
    update_data: dict
    action: str

class DeleteCollectionData(BaseModel):
    collection: str
    filter: dict