from fastapi import FastAPI, status

app = FastAPI()


@app.get("/health", status_code=status.HTTP_200_OK)
async def root():
    return {}